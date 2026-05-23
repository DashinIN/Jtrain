import { useMemo } from "react";
import type { StudyCard } from "../types/cards";
import type { ProgressStore } from "../types/srs";
import { isDue } from "../utils/dates";
import { shuffle, uniqueBy } from "../utils/shuffle";

export function useDailySession(allCards: StudyCard[], progress: ProgressStore, dailyNewCards: number) {
  return useMemo(() => {
    const stateFor = (item: StudyCard) => progress.cards[item.card.id];
    const due = allCards.filter((item) => {
      const state = stateFor(item);
      return state && isDue(state.nextReview);
    });
    const weak = allCards.filter((item) => stateFor(item)?.isWeak);
    const fresh = allCards.filter((item) => !stateFor(item)).slice(0, Math.max(0, dailyNewCards));
    const availableNew = allCards.filter((item) => !stateFor(item)).length;
    const dailyCards = uniqueBy([...shuffle(due), ...shuffle(weak), ...shuffle(fresh)], (item) => item.card.id).slice(0, 24);
    const weakCards = uniqueBy(shuffle(weak), (item) => item.card.id).slice(0, 18);

    return {
      due,
      weak,
      availableNew,
      dailyCards,
      weakCards,
      buildDailySession: () => shuffle(dailyCards),
      buildWeakSession: () => shuffle(weakCards),
    };
  }, [allCards, dailyNewCards, progress.cards]);
}
