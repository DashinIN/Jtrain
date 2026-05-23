import type { KanjiCard } from "../types/cards";
import kanjiFull from "./generated/kanjiFull.json";

export const kanjiCards = kanjiFull as unknown as KanjiCard[];

export function findKanji(kanji: string) {
  return kanjiCards.find((card) => card.kanji === kanji);
}
