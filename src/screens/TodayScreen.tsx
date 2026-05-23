import { useState } from "react";
import type { StudyCard } from "../types/cards";
import type { ProgressStore, SrsGrade } from "../types/srs";
import type { UserSettings } from "../types/settings";
import type { createTranslator } from "../i18n/translations";
import { useDailySession } from "../hooks/useDailySession";
import { useStats } from "../hooks/useStats";
import { SessionRunner } from "../components/SessionRunner";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";

interface Props {
  allCards: StudyCard[];
  progress: ProgressStore;
  settings: UserSettings;
  t: ReturnType<typeof createTranslator>;
  onAnswer: (card: StudyCard, isCorrect: boolean, responseTimeMs: number, grade: SrsGrade) => void;
  onSessionComplete: (summary: { correct: number; wrong: number; averageTimeMs: number; weakFound: number; cards: number }) => void;
}

export function TodayScreen({ allCards, progress, settings, t, onAnswer, onSessionComplete }: Props) {
  const stats = useStats(allCards, progress);
  const session = useDailySession(allCards, progress, settings.dailyNewCards);
  const [activeCards, setActiveCards] = useState<StudyCard[] | null>(null);
  const [title, setTitle] = useState(t("dailySession"));

  if (activeCards) {
    return (
      <SessionRunner
        title={title}
        cards={activeCards}
        allCards={allCards}
        settings={settings}
        t={t}
        onAnswer={onAnswer}
        onComplete={onSessionComplete}
        onDone={() => setActiveCards(null)}
        onTrainWeak={() => {
          setTitle(t("weak"));
          setActiveCards(session.buildWeakSession());
        }}
      />
    );
  }

  return (
    <div className="screen-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">{t("today")}</p>
          <h2>{t("heroTitle")}</h2>
          <p>{t("heroCopy")}</p>
        </div>
        <button className="primary large" type="button" onClick={() => { setTitle(t("dailySession")); setActiveCards(session.buildDailySession()); }}>
          {t("startDailySession")}
        </button>
      </section>
      <div className="stat-grid">
        <StatCard label={t("dueReviewsToday")} value={session.due.length} />
        <StatCard label={t("newCardsAvailable")} value={session.availableNew} />
        <StatCard label={t("streak")} value={stats.streak} detail={`${t("best")} ${stats.bestStreak}`} />
        <StatCard label={t("recentAccuracy")} value={`${stats.accuracy}%`} />
        <StatCard label={t("weakCards")} value={session.weak.length} />
      </div>
      {!session.dailyCards.length && <EmptyState title={t("noDueCards")} copy={t("noDueCardsCopy")} />}
    </div>
  );
}
