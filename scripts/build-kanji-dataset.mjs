import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import readline from "node:readline";

const root = process.cwd();
const vendorDir = path.join(root, "vendor", "kanji");
const outDir = path.join(root, "src", "data", "generated");
const kanjidicPath = path.join(vendorDir, "kanjidic2.xml");
const kanjiVgDir = path.join(vendorDir, "kanjivg-master", "kanji");
const sentencesPath = path.join(vendorDir, "sentences.csv");
const linksPath = path.join(vendorDir, "links.csv");
const tatoebaLangToAppLang = {
  eng: "en",
  rus: "ru",
  spa: "es",
  deu: "de",
  fra: "fr",
  cmn: "zh",
  kor: "ko",
  por: "pt",
};

const kanaLike = /^[\u3040-\u30ff.ー-]+$/;
const cjkRange = /[\u3400-\u9fff]/u;

function tagValue(block, tag) {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? decodeXml(match[1].trim()) : undefined;
}

function tagValues(block, tag) {
  return [...block.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "g"))].map((match) => decodeXml(match[1].trim()));
}

function attrValues(block, attr) {
  return [...block.matchAll(new RegExp(`${attr}="([^"]+)"`, "g"))].map((match) => decodeXml(match[1]));
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function parseKanjiDic(xml) {
  const entries = [];
  for (const [, block] of xml.matchAll(/<character>([\s\S]*?)<\/character>/g)) {
    const literal = tagValue(block, "literal");
    if (!literal) continue;
    const grade = Number(tagValue(block, "grade") ?? 99);
    if (!(grade >= 1 && grade <= 8)) continue;
    const readings = [...block.matchAll(/<reading r_type="([^"]+)">([\s\S]*?)<\/reading>/g)];
    const meanings = [...block.matchAll(/<meaning(?! m_lang=)[^>]*>([\s\S]*?)<\/meaning>/g)].map((match) => decodeXml(match[1].trim()));
    const onyomi = readings.filter(([, type]) => type === "ja_on").map(([, , value]) => decodeXml(value.trim()));
    const kunyomi = readings.filter(([, type]) => type === "ja_kun").map(([, , value]) => decodeXml(value.trim()));
    entries.push({
      kanji: literal,
      meaning: meanings.slice(0, 4).join("; ") || "meaning unavailable",
      onyomi,
      kunyomi,
      level: "N5",
      grade,
      jlpt: Number(tagValue(block, "jlpt") ?? 0) || undefined,
      frequencyRank: Number(tagValue(block, "freq") ?? 99999),
      strokeCount: Number(tagValue(block, "stroke_count") ?? 0),
      radicalNames: tagValues(block, "rad_name"),
      nelsonRadical: attrValues(block, "rad_type").length ? undefined : undefined,
    });
  }
  return entries;
}

async function parseKanjiVgComponents(kanji) {
  const codePoint = kanji.codePointAt(0)?.toString(16).padStart(5, "0");
  if (!codePoint) return [];
  const filePath = path.join(kanjiVgDir, `${codePoint}.svg`);
  try {
    const svg = await fs.readFile(filePath, "utf8");
    const seen = new Set();
    for (const [, element] of svg.matchAll(/kvg:element="([^"]+)"/g)) {
      if (element !== kanji && cjkRange.test(element)) seen.add(element);
    }
    return [...seen].slice(0, 8);
  } catch {
    return [];
  }
}

async function eachLine(filePath, onLine) {
  const rl = readline.createInterface({
    input: createReadStream(filePath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });
  for await (const line of rl) await onLine(line);
}

async function parseTatoeba(joyoSet) {
  const japaneseById = new Map();
  const candidateIdsByKanji = new Map([...joyoSet].map((kanji) => [kanji, []]));
  try {
    await eachLine(sentencesPath, (line) => {
      const [id, lang, text] = line.split("\t");
      if (!id || lang !== "jpn" || !text || text.length > 42) return;
      const matched = [...new Set(Array.from(text).filter((char) => joyoSet.has(char)))];
      if (!matched.length) return;
      japaneseById.set(id, text);
      for (const kanji of matched) candidateIdsByKanji.get(kanji)?.push(id);
    });

    const targetIds = new Set();
    const targetIdsByJapanese = new Map();
    await eachLine(linksPath, (line) => {
      const [a, b] = line.split("\t");
      if (japaneseById.has(a)) {
        targetIds.add(b);
        if (!targetIdsByJapanese.has(a)) targetIdsByJapanese.set(a, []);
        targetIdsByJapanese.get(a).push(b);
      }
      if (japaneseById.has(b)) {
        targetIds.add(a);
        if (!targetIdsByJapanese.has(b)) targetIdsByJapanese.set(b, []);
        targetIdsByJapanese.get(b).push(a);
      }
    });

    const targetById = new Map();
    await eachLine(sentencesPath, (line) => {
      const [id, lang, text] = line.split("\t");
      const appLang = tatoebaLangToAppLang[lang];
      if (appLang && targetIds.has(id)) targetById.set(id, { lang: appLang, text });
    });

    const pairsByKanji = new Map();
    for (const [kanji, ids] of candidateIdsByKanji) {
      const pairs = [];
      for (const id of ids) {
        const translations = {};
        for (const targetId of targetIdsByJapanese.get(id) ?? []) {
          const target = targetById.get(targetId);
          if (target && !translations[target.lang]) translations[target.lang] = target.text;
        }
        const translation = translations.en ?? translations.ru ?? translations.es ?? translations.de ?? translations.fr ?? translations.zh ?? translations.ko ?? translations.pt;
        if (!translation) continue;
        pairs.push({ id, japanese: japaneseById.get(id), translation, translations });
        if (pairs.length >= 8) break;
      }
      pairsByKanji.set(kanji, pairs);
    }
    return pairsByKanji;
  } catch {
    return new Map();
  }
}

function selectSentence(kanji, pairsByKanji, usedIds) {
  const found = (pairsByKanji.get(kanji) ?? []).find((pair) => !usedIds.has(pair.id));
  if (found) {
    usedIds.add(found.id);
    return {
      japanese: found.japanese,
      translation: found.translation,
      translations: found.translations,
      source: "tatoeba",
      license: "CC BY 2.0 FR",
      attribution: `Tatoeba sentence #${found.id}`,
      url: `https://tatoeba.org/en/sentences/show/${found.id}`,
    };
  }
  return {
    japanese: `この漢字は「${kanji}」です。`,
    translation: `This kanji is "${kanji}".`,
    source: "generated",
    license: "Project generated fallback",
    attribution: "JTrain generated fallback sentence",
  };
}

function inferLevel(entry) {
  if (entry.jlpt === 4 || entry.grade <= 2) return "N5";
  if (entry.jlpt === 3 || entry.grade <= 4) return "N4";
  return "N4";
}

function learningExplanation(entry, components, builds) {
  const readings = [...entry.kunyomi, ...entry.onyomi].slice(0, 3).join(", ") || "no common reading in source";
  const componentText = components.length ? `It is visually built from ${components.join(" + ")}.` : "Treat it as a primitive shape in this learning path.";
  const buildText = builds.length ? `It later helps build ${builds.slice(0, 5).join(", ")}.` : "It is not used as a visible prerequisite for another Joyo kanji in this local graph.";
  return `${componentText} Core meaning: ${entry.meaning}. First readings to learn: ${readings}. ${buildText}`;
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const xml = await fs.readFile(kanjidicPath, "utf8");
  const entries = parseKanjiDic(xml);
  const componentMap = new Map();
  for (const entry of entries) {
    componentMap.set(entry.kanji, await parseKanjiVgComponents(entry.kanji));
  }
  const joyoSet = new Set(entries.map((entry) => entry.kanji));
  for (const [kanji, components] of componentMap) {
    componentMap.set(kanji, components.filter((component) => joyoSet.has(component) && component !== kanji));
  }
  const buildsMap = new Map(entries.map((entry) => [entry.kanji, []]));
  for (const [kanji, components] of componentMap) {
    for (const component of components) {
      buildsMap.get(component)?.push(kanji);
    }
  }
  const sentencePairs = await parseTatoeba(joyoSet);
  const usedSentenceIds = new Set();
  const baseOrder = [...entries].sort((a, b) => {
    const grade = a.grade - b.grade;
    if (grade) return grade;
    const strokes = a.strokeCount - b.strokeCount;
    if (strokes) return strokes;
    return a.frequencyRank - b.frequencyRank;
  });
  const remaining = new Map(baseOrder.map((entry) => [entry.kanji, entry]));
  const ordered = [];
  while (remaining.size) {
    const ready = [...remaining.values()].filter((entry) =>
      (componentMap.get(entry.kanji) ?? []).every((component) => !remaining.has(component)),
    );
    const batch = ready.length ? ready : [remaining.values().next().value];
    batch.sort((a, b) => baseOrder.indexOf(a) - baseOrder.indexOf(b));
    for (const entry of batch) {
      ordered.push(entry);
      remaining.delete(entry.kanji);
    }
  }
  const cards = ordered.map((entry, index) => {
    const components = componentMap.get(entry.kanji) ?? [];
    const builds = [...new Set(buildsMap.get(entry.kanji) ?? [])].sort((a, b) => ordered.findIndex((entry) => entry.kanji === a) - ordered.findIndex((entry) => entry.kanji === b));
    return {
      id: `kanji-${String(index + 1).padStart(4, "0")}-${entry.kanji}`,
      kanji: entry.kanji,
      meaning: entry.meaning,
      onyomi: entry.onyomi,
      kunyomi: entry.kunyomi,
      level: inferLevel(entry),
      order: index + 1,
      grade: entry.grade,
      jlpt: entry.jlpt,
      frequencyRank: entry.frequencyRank === 99999 ? undefined : entry.frequencyRank,
      strokeCount: entry.strokeCount,
      components,
      builds,
      etymology: learningExplanation(entry, components, builds),
      mnemonic: learningExplanation(entry, components, builds),
      examples: [],
      exampleSentence: selectSentence(entry.kanji, sentencePairs, usedSentenceIds),
      audio: { source: "web-speech", license: "Browser Web Speech fallback" },
      sources: {
        kanji: "KANJIDIC2 / EDRDG CC BY-SA 4.0",
        components: "KanjiVG CC BY-SA 3.0",
        sentences: "Tatoeba CC BY 2.0 FR where available; generated fallback otherwise",
      },
    };
  });
  await fs.writeFile(path.join(outDir, "kanjiFull.json"), `${JSON.stringify(cards, null, 2)}\n`, "utf8");
  await fs.writeFile(
    path.join(outDir, "kanjiSources.json"),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        kanjiCount: cards.length,
        tatoebaSentenceCount: cards.filter((card) => card.exampleSentence.source === "tatoeba").length,
        sources: [
          {
            name: "KANJIDIC2",
            license: "Creative Commons Attribution-ShareAlike 4.0",
            url: "https://www.edrdg.org/wiki/KANJIDIC_Project",
          },
          {
            name: "KanjiVG",
            license: "Creative Commons Attribution-ShareAlike 3.0",
            url: "https://kanjivg.tagaini.net/",
          },
          {
            name: "Tatoeba text sentences",
            license: "CC BY 2.0 FR / CC0 depending on sentence metadata",
            url: "https://tatoeba.org/downloads",
          },
        ],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  console.log(`Generated ${cards.length} kanji cards (${cards.filter((card) => card.exampleSentence.source === "tatoeba").length} with Tatoeba examples).`);
}

void main();
