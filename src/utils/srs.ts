import type { AnswerResult, ProgressStore, SrsGrade, SrsState } from "../types/srs";
import type { CardType } from "../types/cards";
import { addDays, toDateKey } from "./dates";

export const emptyProgress: ProgressStore = {
  cards: {},
  logs: [],
  bestStreak: 0,
  lastSessionDate: null,
};

export const slowThresholds: Record<CardType, number> = {
  kana: 2500,
  kanji: 7000,
  word: 5000,
  sentence: 12000,
  particle: 6000,
};

export function createSrsState(id: string, type: CardType): SrsState {
  return {
    id,
    type,
    correctCount: 0,
    wrongCount: 0,
    lastSeen: null,
    nextReview: null,
    interval: 0,
    ease: 2.5,
    averageTimeMs: 0,
    isWeak: false,
    slowCount: 0,
  };
}

function intervalForGrade(state: SrsState, grade: SrsGrade): number {
  if (grade === "again") return 0;
  if (grade === "hard") return Math.max(1, state.interval || 1);
  if (grade === "easy") return Math.max(3, Math.ceil((state.interval || 1) * 3.1));
  return Math.max(1, Math.ceil((state.interval || 1) * 2));
}

export function applyAnswer(state: SrsState, result: AnswerResult): SrsState {
  const grade = result.grade ?? (result.isCorrect ? "good" : "again");
  const interval = result.isCorrect ? intervalForGrade(state, grade) : 0;
  const slow = result.responseTimeMs > slowThresholds[result.type];
  const easeDelta: Record<SrsGrade, number> = {
    again: -0.25,
    hard: -0.12,
    good: 0.03,
    easy: 0.12,
  };
  const seenCount = state.correctCount + state.wrongCount;
  const averageTimeMs =
    seenCount === 0
      ? result.responseTimeMs
      : Math.round((state.averageTimeMs * seenCount + result.responseTimeMs) / (seenCount + 1));
  const slowCount = state.slowCount + (slow && result.isCorrect ? 1 : 0);
  const isWeak = !result.isCorrect || grade === "again" || grade === "hard" || slowCount >= 2 || state.wrongCount >= 2;

  return {
    ...state,
    correctCount: state.correctCount + (result.isCorrect ? 1 : 0),
    wrongCount: state.wrongCount + (result.isCorrect ? 0 : 1),
    lastSeen: toDateKey(),
    nextReview: result.isCorrect ? addDays(interval) : toDateKey(),
    interval,
    ease: Math.max(1.3, Math.min(3.2, state.ease + easeDelta[grade])),
    averageTimeMs,
    isWeak,
    slowCount,
  };
}
