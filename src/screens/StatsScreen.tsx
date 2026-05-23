import type { StudyCard } from "../types/cards";
import type { ProgressStore } from "../types/srs";
import type { createTranslator } from "../i18n/translations";
import { useStats } from "../hooks/useStats";
import { StatCard } from "../components/StatCard";
import { WeakSpotList } from "../components/WeakSpotList";

interface Props {
  allCards: StudyCard[];
  progress: ProgressStore;
  t: ReturnType<typeof createTranslator>;
}

export function StatsScreen({ allCards, progress, t }: Props) {
  const stats = useStats(allCards, progress);
  const weakStates = Object.values(progress.cards).filter((state) => state.isWeak).slice(0, 12);
  return (
    <div className="screen-stack">
      <div className="stat-grid">
        <StatCard label={t("learnedKana")} value={stats.totalLearnedKana} />
        <StatCard label={t("learnedKanji")} value={stats.totalLearnedKanji} />
        <StatCard label={t("learnedWords")} value={stats.totalLearnedWords} />
        <StatCard label={t("totalReviews")} value={stats.totalReviews} />
        <StatCard label={t("accuracy")} value={`${stats.accuracy}%`} />
        <StatCard label={t("averageResponse")} value={`${Math.round(stats.averageResponseTime / 100) / 10}s`} />
        <StatCard label={t("streak")} value={stats.streak} detail={`${t("best")} ${stats.bestStreak}`} />
        <StatCard label={t("cardsDueToday")} value={stats.cardsDueToday} />
        <StatCard label={t("weakCards")} value={stats.weakCardsCount} />
        <StatCard label={t("correctToday")} value={stats.correctAnswersToday} />
        <StatCard label={t("wrongToday")} value={stats.wrongAnswersToday} />
        <StatCard label={t("sessions")} value={stats.sessionsCompleted} />
      </div>
      <section className="panel">
        <h2>{t("accuracyByCategory")}</h2>
        <div className="category-bars">
          {stats.accuracyByCategory.map((item) => (
            <div key={item.type}>
              <span>{item.type}</span>
              <div><i style={{ width: `${item.accuracy}%` }} /></div>
              <strong>{item.accuracy}%</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <h2>{t("problematicCards")}</h2>
        <WeakSpotList states={weakStates} cards={allCards} t={t} />
      </section>
    </div>
  );
}
