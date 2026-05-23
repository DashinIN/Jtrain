import type { CardType } from "./cards";

export interface SrsState {
  id: string;
  type: CardType;
  correctCount: number;
  wrongCount: number;
  lastSeen: string | null;
  nextReview: string | null;
  interval: number;
  ease: number;
  averageTimeMs: number;
  isWeak: boolean;
  slowCount: number;
}

export interface SessionLog {
  id: string;
  date: string;
  correct: number;
  wrong: number;
  averageTimeMs: number;
  cards: number;
}

export interface ProgressStore {
  cards: Record<string, SrsState>;
  logs: SessionLog[];
  bestStreak: number;
  lastSessionDate: string | null;
}

export type SrsGrade = "again" | "hard" | "good" | "easy";

export interface AnswerResult {
  cardId: string;
  type: CardType;
  isCorrect: boolean;
  responseTimeMs: number;
  grade?: SrsGrade;
}
