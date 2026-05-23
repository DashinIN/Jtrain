import { useMemo, useState } from "react";
import type { StudyCard } from "../types/cards";
import type { ProgressStore, SrsGrade } from "../types/srs";
import type { UserSettings } from "../types/settings";
import type { createTranslator } from "../i18n/translations";
import { SessionRunner } from "../components/SessionRunner";
import { WeakSpotList } from "../components/WeakSpotList";

interface Props {
  allCards: StudyCard[];
  progress: ProgressStore;
  settings: UserSettings;
  t: ReturnType<typeof createTranslator>;
  onAnswer: (card: StudyCard, isCorrect: boolean, responseTimeMs: number, grade: SrsGrade) => void;
  onSessionComplete: (summary: { correct: number; wrong: number; averageTimeMs: number; weakFound: number; cards: number }) => void;
}

export function WeakSpotsScreen({ allCards, progress, settings, t, onAnswer, onSessionComplete }: Props) {
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState<StudyCard[] | null>(null);
  const weakStates = useMemo(() => Object.values(progress.cards).filter((state) => state.isWeak && (filter === "all" || state.type === filter)), [filter, progress.cards]);
  const weakCards = weakStates.map((state) => allCards.find((card) => card.card.id === state.id)).filter(Boolean) as StudyCard[];

  if (active) {
    return <SessionRunner title={t("weak")} cards={active} allCards={allCards} settings={settings} t={t} onAnswer={onAnswer} onComplete={onSessionComplete} onDone={() => setActive(null)} onTrainWeak={() => setActive(weakCards)} />;
  }

  return (
    <div className="screen-stack">
      <section className="panel controls-panel">
        <h2>{t("weak")}</h2>
        <div className="action-row">
          {["all", "kana", "kanji", "word", "sentence", "particle"].map((item) => (
            <button key={item} className={filter === item ? "primary" : "secondary"} type="button" onClick={() => setFilter(item)}>{item}</button>
          ))}
        </div>
        <button className="primary large" type="button" onClick={() => setActive(weakCards)} disabled={!weakCards.length}>{t("trainWeakSpots")}</button>
      </section>
      <section className="panel">
        <WeakSpotList states={weakStates} cards={allCards} t={t} />
      </section>
    </div>
  );
}
