import { useState } from "react";
import type { StudyCard } from "../types/cards";
import type { ProgressStore, SrsGrade } from "../types/srs";
import type { UserSettings } from "../types/settings";
import type { createTranslator } from "../i18n/translations";
import { particleCards } from "../data/particles";
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

export function ParticlesScreen({ allCards, progress, settings, t, onAnswer, onSessionComplete }: Props) {
  const [active, setActive] = useState(false);
  const cards = particleCards.map((card) => ({ type: "particle" as const, card }));
  const weakStates = Object.values(progress.cards).filter((state) => state.type === "particle" && state.isWeak);
  if (active) {
    return <SessionRunner title={t("particles")} cards={cards} allCards={allCards} settings={settings} t={t} onAnswer={onAnswer} onComplete={onSessionComplete} onDone={() => setActive(false)} onTrainWeak={() => setActive(true)} />;
  }
  return (
    <div className="screen-stack">
      <section className="panel controls-panel">
        <h2>{t("particles")}</h2>
        <p>{t("particleIntro")}</p>
        <button className="primary large" type="button" onClick={() => setActive(true)}>{t("startParticleQuiz")}</button>
      </section>
      <section className="panel">
        <h2>{t("particleErrors")}</h2>
        <WeakSpotList states={weakStates} cards={allCards} t={t} />
      </section>
    </div>
  );
}
