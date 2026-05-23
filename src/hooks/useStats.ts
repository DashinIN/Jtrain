import { useMemo } from "react";
import type { StudyCard } from "../types/cards";
import type { ProgressStore } from "../types/srs";
import { isDue, toDateKey } from "../utils/dates";

export function useStats(allCards: StudyCard[], progress: ProgressStore) {
  return useMemo(() => {
    const states = Object.values(progress.cards);
    const totalAnswers = states.reduce((sum, state) => sum + state.correctCount + state.wrongCount, 0);
    const correct = states.reduce((sum, state) => sum + state.correctCount, 0);
    const today = toDateKey();
    const todayLogs = progress.logs.filter((log) => log.date === today);
    const learned = (type: StudyCard["type"]) =>
      allCards.filter((item) => item.type === type && (progress.cards[item.card.id]?.correctCount ?? 0) >= 2).length;
    const averageResponseTime =
      states.length === 0 ? 0 : Math.round(states.reduce((sum, state) => sum + state.averageTimeMs, 0) / states.length);
    const dueCount = allCards.filter((item) => isDue(progress.cards[item.card.id]?.nextReview ?? null)).length;
    const weakStates = states.filter((state) => state.isWeak);
    const accuracyByCategory = ["kana", "kanji", "word", "sentence", "particle"].map((type) => {
      const categoryStates = states.filter((state) => state.type === type);
      const categoryTotal = categoryStates.reduce((sum, state) => sum + state.correctCount + state.wrongCount, 0);
      const categoryCorrect = categoryStates.reduce((sum, state) => sum + state.correctCount, 0);
      return { type, accuracy: categoryTotal ? Math.round((categoryCorrect / categoryTotal) * 100) : 0 };
    });

    return {
      totalLearnedKana: learned("kana"),
      totalLearnedKanji: learned("kanji"),
      totalLearnedWords: learned("word"),
      totalReviews: totalAnswers,
      accuracy: totalAnswers ? Math.round((correct / totalAnswers) * 100) : 0,
      averageResponseTime,
      streak: progress.logs.length ? 1 : 0,
      bestStreak: progress.bestStreak,
      cardsDueToday: dueCount,
      weakCardsCount: weakStates.length,
      correctAnswersToday: todayLogs.reduce((sum, log) => sum + log.correct, 0),
      wrongAnswersToday: todayLogs.reduce((sum, log) => sum + log.wrong, 0),
      sessionsCompleted: progress.logs.length,
      problemKana: states.filter((state) => state.type === "kana" && state.isWeak).slice(0, 6),
      problemWords: states.filter((state) => state.type === "word" && state.isWeak).slice(0, 6),
      accuracyByCategory,
    };
  }, [allCards, progress]);
}
