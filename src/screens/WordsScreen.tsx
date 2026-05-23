import { useState } from "react";
import type { StudyCard } from "../types/cards";
import type { ProgressStore, SrsGrade } from "../types/srs";
import type { UserSettings } from "../types/settings";
import type { createTranslator } from "../i18n/translations";
import { wordCards } from "../data/words";
import { SessionRunner } from "../components/SessionRunner";

interface Props {
  allCards: StudyCard[];
  progress: ProgressStore;
  settings: UserSettings;
  t: ReturnType<typeof createTranslator>;
  onAnswer: (card: StudyCard, isCorrect: boolean, responseTimeMs: number, grade: SrsGrade) => void;
  onSessionComplete: (summary: { correct: number; wrong: number; averageTimeMs: number; weakFound: number; cards: number }) => void;
}

export function WordsScreen({ allCards, progress, settings, t, onAnswer, onSessionComplete }: Props) {
  const [mode, setMode] = useState("word-reading");
  const [weakOnly, setWeakOnly] = useState(false);
  const [active, setActive] = useState<StudyCard[] | null>(null);
  const wordStudyCards = wordCards
    .filter((card) => !weakOnly || progress.cards[card.id]?.isWeak)
    .map((card) => ({ type: "word" as const, card }));

  if (active) {
    return (
      <SessionRunner
        title={t("wordsTraining")}
        cards={active}
        allCards={allCards}
        settings={settings}
        t={t}
        mode={mode}
        onAnswer={onAnswer}
        onComplete={onSessionComplete}
        onDone={() => setActive(null)}
        onTrainWeak={() => setActive(wordStudyCards.filter((item) => progress.cards[item.card.id]?.isWeak))}
      />
    );
  }

  return (
    <div className="screen-stack">
      <section className="panel controls-panel">
        <h2>{t("words")}</h2>
        <div className="control-grid">
          <label>{t("exercise")}<select value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="word-reading">{t("wordToReading")}</option>
            <option value="word-meaning">{t("wordToMeaning")}</option>
            <option value="reading-word">{t("readingToWord")}</option>
            <option value="meaning-word">{t("meaningToWord")}</option>
          </select></label>
          <label className="inline-check"><input type="checkbox" checked={weakOnly} onChange={(event) => setWeakOnly(event.target.checked)} /> {t("onlyWeakWords")}</label>
        </div>
        <button className="primary large" type="button" onClick={() => setActive(wordStudyCards.slice(0, 24))}>{t("startWordsDrill")}</button>
      </section>
      <section className="word-table panel">
        <h2>{t("localN5WordSet")}</h2>
        {wordCards.map((word) => (
          <article key={word.id}>
            <strong>{word.word}</strong>
            <span>{word.reading}</span>
            <span>{word.meaning}</span>
            {word.isIrregular && <small>{t("irregular")}</small>}
          </article>
        ))}
      </section>
    </div>
  );
}
