import { useCallback } from "react";
import type { AnswerResult, ProgressStore, SessionLog, SrsState } from "../types/srs";
import type { CardType } from "../types/cards";
import { applyAnswer, createSrsState, emptyProgress } from "../utils/srs";
import { isDue, toDateKey } from "../utils/dates";
import { useLocalStorage } from "./useLocalStorage";

export function useSrsProgress() {
  const [progress, setProgress] = useLocalStorage<ProgressStore>("jtrain-progress", emptyProgress);

  const getCardState = useCallback(
    (cardId: string, type: CardType): SrsState => progress.cards[cardId] ?? createSrsState(cardId, type),
    [progress.cards],
  );

  const updateAfterAnswer = useCallback(
    (result: AnswerResult) => {
      setProgress((current) => {
        const previous = current.cards[result.cardId] ?? createSrsState(result.cardId, result.type);
        const next = applyAnswer(previous, result);
        return {
          ...current,
          cards: {
            ...current.cards,
            [result.cardId]: next,
          },
        };
      });
    },
    [setProgress],
  );

  const addSessionLog = useCallback(
    (log: Omit<SessionLog, "id" | "date">) => {
      setProgress((current) => {
        const today = toDateKey();
        const nextLogs = [
          ...current.logs,
          {
            ...log,
            id: `session-${Date.now()}`,
            date: today,
          },
        ];
        const bestStreak = Math.max(current.bestStreak, current.lastSessionDate === today ? current.bestStreak : 1);
        return {
          ...current,
          logs: nextLogs,
          lastSessionDate: today,
          bestStreak,
        };
      });
    },
    [setProgress],
  );

  const getDueCards = useCallback(() => Object.values(progress.cards).filter((state) => isDue(state.nextReview)), [progress.cards]);
  const getWeakCards = useCallback(() => Object.values(progress.cards).filter((state) => state.isWeak), [progress.cards]);
  const resetProgress = useCallback(() => setProgress(emptyProgress), [setProgress]);
  const importProgress = useCallback((next: ProgressStore) => setProgress(next), [setProgress]);

  return { progress, getCardState, updateAfterAnswer, addSessionLog, getDueCards, getWeakCards, resetProgress, importProgress };
}
