import { useMemo, useState } from "react";
import type { AudioMeta, StudyCard } from "../types/cards";
import type { SrsGrade } from "../types/srs";
import type { UserSettings } from "../types/settings";
import type { Translator } from "../i18n/translations";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { promptForCard } from "../utils/quiz";
import { localizedExplanation, promptLabel } from "../utils/localizedContent";
import { MultipleChoice } from "./MultipleChoice";
import { ProgressBar } from "./ProgressBar";
import { QuizCard } from "./QuizCard";
import { SessionSummary } from "./SessionSummary";
import { SrsButtons } from "./SrsButtons";
import { FuriganaToggle } from "./FuriganaToggle";

interface Props {
  title: string;
  cards: StudyCard[];
  allCards: StudyCard[];
  settings: UserSettings;
  t: Translator;
  mode?: string;
  onAnswer: (card: StudyCard, isCorrect: boolean, responseTimeMs: number, grade: SrsGrade) => void;
  onComplete: (summary: { correct: number; wrong: number; averageTimeMs: number; weakFound: number; cards: number }) => void;
  onDone: () => void;
  onTrainWeak: () => void;
}

function audioFor(card: StudyCard): AudioMeta | undefined {
  return card.card.audio;
}

function audioTextFor(card: StudyCard, settings: UserSettings) {
  if (card.type === "kana") return card.card.kana;
  if (card.type === "kanji") return card.card.examples[0]?.word ?? card.card.kanji;
  if (card.type === "word") return settings.preferKanaReadingForWordAudio ? card.card.reading : card.card.word;
  if (card.type === "particle") return card.card.sentence;
  return card.card.japanese;
}

export function SessionRunner({ title, cards, allCards, settings, t, mode = "mixed", onAnswer, onComplete, onDone, onTrainWeak }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [furigana, setFurigana] = useState(settings.furiganaMode === "always");
  const [totals, setTotals] = useState({ correct: 0, wrong: 0, responseTimeMs: 0, weakFound: 0 });
  const [done, setDone] = useState(false);
  const current = cards[index];
  const prompt = useMemo(() => (current ? promptForCard(current, allCards, mode) : null), [allCards, current, mode]);

  const answerState = selected ? (selected === prompt?.answer ? "correct" : "wrong") : revealed ? "wrong" : "idle";
  const responseTimeMs = Date.now() - startTime;
  const isSentence = current?.type === "sentence";

  const finishWithGrade = (grade: SrsGrade) => {
    if (!current || !prompt) return;
    const isCorrect = isSentence ? grade === "good" || grade === "easy" : selected === prompt.answer && !revealed;
    const measured = Math.max(300, responseTimeMs);
    onAnswer(current, isCorrect, measured, grade);
    const weakFound = !isCorrect || grade === "again" || grade === "hard" ? 1 : 0;
    const nextTotals = {
      correct: totals.correct + (isCorrect ? 1 : 0),
      wrong: totals.wrong + (isCorrect ? 0 : 1),
      responseTimeMs: totals.responseTimeMs + measured,
      weakFound: totals.weakFound + weakFound,
    };
    setTotals(nextTotals);
    if (index + 1 >= cards.length) {
      setDone(true);
      onComplete({
        correct: nextTotals.correct,
        wrong: nextTotals.wrong,
        averageTimeMs: Math.round(nextTotals.responseTimeMs / Math.max(1, cards.length)),
        weakFound: nextTotals.weakFound,
        cards: cards.length,
      });
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setRevealed(false);
    setFurigana(settings.furiganaMode === "always");
    setStartTime(Date.now());
  };

  useKeyboardShortcuts({
    enabled: !done,
    onChoice: (choiceIndex) => {
      if (!prompt || selected || isSentence) return;
      setSelected(prompt.choices[choiceIndex]);
    },
    onSpace: () => {
      if (isSentence) setRevealed(true);
      else if (!selected) setRevealed(true);
    },
    onEnter: () => {
      if (isSentence && revealed) finishWithGrade("good");
    },
    onGrade: finishWithGrade,
    onFurigana: () => setFurigana((value) => !value),
  });

  if (!cards.length) {
    return (
      <section className="panel">
        <h2>{title}</h2>
        <p className="empty-copy">{t("noCardsAvailable")}</p>
        <button className="secondary" type="button" onClick={onDone}>{t("back")}</button>
      </section>
    );
  }

  if (done) {
    return (
      <SessionSummary
        correct={totals.correct}
        wrong={totals.wrong}
        averageTimeMs={Math.round(totals.responseTimeMs / Math.max(1, cards.length))}
        weakFound={totals.weakFound}
        onTrainWeak={onTrainWeak}
        onDone={onDone}
        t={t}
      />
    );
  }

  if (!current || !prompt) return null;

  return (
    <div className="session-stack">
      <div className="session-header">
        <h2>{title}</h2>
        <ProgressBar value={index + 1} max={cards.length} label={t("progress")} />
      </div>
      <QuizCard
        label={promptLabel(current, mode, t)}
        prompt={prompt.prompt}
        audioText={audioTextFor(current, settings)}
        audio={audioFor(current)}
        settings={settings}
        state={answerState}
      >
        {current.type === "sentence" && (
          <div className="sentence-tools">
            {current.card.furigana && <FuriganaToggle visible={furigana} onToggle={() => setFurigana((value) => !value)} t={t} />}
            <button className="secondary" type="button" onClick={() => setRevealed(true)}>{t("showTranslation")}</button>
            {furigana && <p className="furigana-line">{current.card.furigana}</p>}
            {revealed && <p className="answer-line">{current.card.translation}</p>}
            <details>
              <summary>{t("breakDown")}</summary>
              <div className="breakdown-grid">
                {current.card.tokens.map((token) => (
                  <div key={`${current.card.id}-${token.surface}`}>
                    <strong>{token.surface}</strong>
                    <span>{token.reading}</span>
                    <span>{token.meaning}</span>
                    <small>{token.pos}</small>
                  </div>
                ))}
              </div>
            </details>
            <SrsButtons onGrade={finishWithGrade} t={t} />
          </div>
        )}
        {!isSentence && (
          <>
            <MultipleChoice
              choices={prompt.choices}
              answer={prompt.answer}
              selected={selected}
              disabled={Boolean(selected)}
              onSelect={(choice) => setSelected(choice)}
            />
            <div className="action-row">
              <button type="button" className="secondary" onClick={() => setRevealed(true)} disabled={Boolean(selected)}>
                {t("iDontKnow")}
              </button>
            </div>
            {(selected || revealed) && (
              <div className="answer-box">
                <strong>{selected === prompt.answer && !revealed ? t("correct") : t("answer")}</strong>
                <p>{prompt.answer}</p>
                {localizedExplanation(current, prompt.explanation, t) && <small>{localizedExplanation(current, prompt.explanation, t)}</small>}
                <SrsButtons onGrade={finishWithGrade} t={t} />
              </div>
            )}
          </>
        )}
      </QuizCard>
    </div>
  );
}
