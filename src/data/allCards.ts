import type { StudyCard } from "../types/cards";
import { kanaCards } from "./kana";
import { kanjiCards } from "./kanji";
import { wordCards } from "./words";
import { sentenceCards } from "./sentences";
import { particleCards } from "./particles";

export const allStudyCards: StudyCard[] = [
  ...kanaCards.map((card) => ({ type: "kana" as const, card })),
  ...kanjiCards.map((card) => ({ type: "kanji" as const, card })),
  ...wordCards.map((card) => ({ type: "word" as const, card })),
  ...sentenceCards.map((card) => ({ type: "sentence" as const, card })),
  ...particleCards.map((card) => ({ type: "particle" as const, card })),
];
