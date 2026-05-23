import { useState } from "react";
import type { StudyCard } from "../types/cards";
import type { SrsGrade } from "../types/srs";
import type { UserSettings } from "../types/settings";
import type { createTranslator } from "../i18n/translations";
import { sentenceCards } from "../data/sentences";
import { SessionRunner } from "../components/SessionRunner";

interface Props {
  allCards: StudyCard[];
  settings: UserSettings;
  t: ReturnType<typeof createTranslator>;
  onAnswer: (card: StudyCard, isCorrect: boolean, responseTimeMs: number, grade: SrsGrade) => void;
  onSessionComplete: (summary: { correct: number; wrong: number; averageTimeMs: number; weakFound: number; cards: number }) => void;
}

export function SentencesScreen({ allCards, settings, t, onAnswer, onSessionComplete }: Props) {
  const [active, setActive] = useState(false);
  const cards = sentenceCards.map((card) => ({ type: "sentence" as const, card }));
  if (active) {
    return <SessionRunner title={t("sentences")} cards={cards} allCards={allCards} settings={settings} t={t} onAnswer={onAnswer} onComplete={onSessionComplete} onDone={() => setActive(false)} onTrainWeak={() => setActive(true)} />;
  }
  return (
    <div className="screen-stack">
      <section className="panel controls-panel">
        <h2>{t("sentences")}</h2>
        <p>{t("sentenceIntro")}</p>
        <button className="primary large" type="button" onClick={() => setActive(true)}>{t("startSentenceDrill")}</button>
      </section>
    </div>
  );
}
