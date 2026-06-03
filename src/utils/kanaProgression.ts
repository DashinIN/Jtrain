import type { KanaCard } from "../types/cards";
import type { ProgressStore } from "../types/srs";

export const MASTERED_CORRECT_COUNT = 10;
export const KANA_UNLOCK_TARGET = MASTERED_CORRECT_COUNT + 1;

const GROUPS: Record<KanaCard["category"], string[][]> = {
  basic: [
    ["a", "i", "u", "e", "o"],
    ["ka", "ki", "ku", "ke", "ko"],
    ["sa", "shi", "su", "se", "so"],
    ["ta", "chi", "tsu", "te", "to"],
    ["na", "ni", "nu", "ne", "no"],
    ["ha", "hi", "fu", "he", "ho"],
    ["ma", "mi", "mu", "me", "mo"],
    ["ya", "yu", "yo"],
    ["ra", "ri", "ru", "re", "ro"],
    ["wa", "wo", "n"],
  ],
  dakuten: [
    ["ga", "gi", "gu", "ge", "go"],
    ["za", "ji", "zu", "ze", "zo"],
    ["da", "ji", "zu", "de", "do"],
    ["ba", "bi", "bu", "be", "bo"],
  ],
  handakuten: [["pa", "pi", "pu", "pe", "po"]],
  yoon: [
    ["kya", "kyu", "kyo"],
    ["sha", "shu", "sho"],
    ["cha", "chu", "cho"],
    ["nya", "nyu", "nyo"],
    ["rya", "ryu", "ryo"],
  ],
  "small-tsu": [["small tsu"], ["gakkou", "kitte", "beddo"]],
  "long-vowel": [["ou", "ei", "okaasan"], ["koohii", "suupaa", "geemu"]],
};

function scriptsFor(script: "hiragana" | "katakana" | "both") {
  if (script === "both") return ["hiragana", "katakana"] as const;
  return [script] as const;
}

function matchesGroup(card: KanaCard, group: string[]) {
  return group.includes(card.romaji);
}

function buildGroups(cards: KanaCard[], script: "hiragana" | "katakana" | "both", category: KanaCard["category"] | "all") {
  const categories = category === "all"
    ? (["basic", "dakuten", "handakuten", "yoon", "small-tsu", "long-vowel"] as const)
    : [category];

  const result: KanaCard[][] = [];
  const selectedScripts = scriptsFor(script);

  if (script === "both") {
    for (const categoryName of categories) {
      for (const group of GROUPS[categoryName]) {
        for (const scriptName of selectedScripts) {
          const items = cards.filter((card) => card.script === scriptName && card.category === categoryName && matchesGroup(card, group));
          if (items.length) result.push(items);
        }
      }
    }
    return result;
  }

  for (const categoryName of categories) {
    for (const group of GROUPS[categoryName]) {
      const items = cards.filter((card) => card.script === script && card.category === categoryName && matchesGroup(card, group));
      if (items.length) result.push(items);
    }
  }

  return result;
}

export function orderedKanaCards(
  cards: KanaCard[],
  script: "hiragana" | "katakana" | "both",
  category: KanaCard["category"] | "all",
) {
  return buildGroups(cards, script, category).flat();
}

export function unlockedKanaCards(
  cards: KanaCard[],
  progress: ProgressStore,
  script: "hiragana" | "katakana" | "both",
  category: KanaCard["category"] | "all",
) {
  const ordered = orderedKanaCards(cards, script, category);
  if (!ordered.length) return [];

  const initialCount = Math.min(5, ordered.length);
  const masteredCount = ordered.filter((card) => (progress.cards[card.id]?.correctCount ?? 0) >= KANA_UNLOCK_TARGET).length;
  const unlockedCount = Math.min(ordered.length, initialCount + masteredCount);

  return ordered.slice(0, unlockedCount);
}
