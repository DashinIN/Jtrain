import type { KanjiCard, ParticleCard, StudyCard } from "../types/cards";
import type { Translator } from "../i18n/translations";

export function kanjiLearningNote(card: KanjiCard, t: Translator) {
  const components = card.components.length
    ? `${t("kanjiComponentsNote")} ${card.components.join(" + ")}.`
    : t("kanjiPrimitiveNote");
  const readings = [...card.kunyomi, ...card.onyomi].slice(0, 3).join(", ") || t("noCommonReading");
  const builds = card.builds.length
    ? `${t("kanjiBuildsNote")} ${card.builds.slice(0, 6).join(", ")}.`
    : t("kanjiNoBuildsNote");
  return `${components} ${t("kanjiMeaningNote")} ${card.meaning}. ${t("kanjiReadingsNote")} ${readings}. ${builds}`;
}

export function particleExplanation(card: ParticleCard, t: Translator) {
  const map: Record<string, ReturnType<typeof t>> = {
    "は": t("particleTopic"),
    "が": t("particleSubject"),
    "を": t("particleObject"),
    "に": t("particleTarget"),
    "で": t("particlePlaceTool"),
    "の": t("particlePossession"),
    "と": t("particleWithAnd"),
    "も": t("particleAlso"),
    "へ": t("particleDirection"),
    "から": t("particleFrom"),
    "まで": t("particleUntil"),
  };
  return map[card.correctParticle] ?? card.explanation;
}

export function promptLabel(card: StudyCard, mode: string, t: Translator) {
  if (card.type === "kana") {
    if (mode === "romaji-kana") return t("romajiToKana");
    if (mode === "kana-romaji") return t("kanaToRomaji");
    if (mode === "speed") return t("speedDrill");
    if (mode === "similar") return t("similarKana");
    return t("mixedKana");
  }
  if (card.type === "kanji") {
    if (mode === "kanji-reading") return t("kanjiToReading");
    if (mode === "kanji-components") return t("kanjiToComponents");
    return t("kanjiToMeaning");
  }
  if (card.type === "word") {
    if (mode === "word-reading") return t("wordToReading");
    if (mode === "word-meaning") return t("wordToMeaning");
    if (mode === "reading-word") return t("readingToWord");
    return t("meaningToWord");
  }
  if (card.type === "particle") return t("particleIntro");
  return t("sentences");
}

export function localizedExplanation(card: StudyCard, fallback: string | undefined, t: Translator) {
  if (card.type === "kanji") return kanjiLearningNote(card.card, t);
  if (card.type === "particle") return particleExplanation(card.card, t);
  return fallback;
}
