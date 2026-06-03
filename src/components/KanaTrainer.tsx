import { useEffect, useMemo, useState } from "react";
import type { StudyCard } from "../types/cards";
import type { ProgressStore, SrsGrade } from "../types/srs";
import type { UserSettings } from "../types/settings";
import type { Translator } from "../i18n/translations";
import { promptForCard } from "../utils/quiz";
import { useAudio } from "../hooks/useAudio";
import { ProgressBar } from "./ProgressBar";
import { MultipleChoice } from "./MultipleChoice";
import { KanaHandwritingPad } from "./KanaHandwritingPad";
import { shuffleItems } from "../utils/session";
import { KANA_UNLOCK_TARGET } from "../utils/kanaProgression";

type KanaStudyCard = Extract<StudyCard, { type: "kana" }>;
type Phase = "study" | "quiz";

interface Props {
  title: string;
  cards: KanaStudyCard[];
  allCards: StudyCard[];
  mode: string;
  handwritingEnabled: boolean;
  progress: ProgressStore;
  settings: UserSettings;
  t: Translator;
  onAnswer: (card: StudyCard, isCorrect: boolean, responseTimeMs: number, grade: SrsGrade) => void;
  onComplete: (summary: { correct: number; wrong: number; averageTimeMs: number; weakFound: number; cards: number }) => void;
  onDone: () => void;
}

const INITIAL_INTRO_COUNT = 5;

function sameIds(a: string[], b: string[]) {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

function playKanaAudio(card: KanaStudyCard, player: ReturnType<typeof useAudio>) {
  if (card.card.audio?.src) player.playLocalAudio(card.card.audio.src, card.card.kana);
  else player.speakWithWebSpeech(card.card.kana);
}

export function KanaTrainer({ title, cards, allCards, mode, handwritingEnabled, progress, settings, t, onAnswer, onComplete, onDone }: Props) {
  const player = useAudio(settings);
  const [phase, setPhase] = useState<Phase>("study");
  const [introducedIds, setIntroducedIds] = useState<string[]>([]);
  const [studyQueueIds, setStudyQueueIds] = useState<string[]>(() => cards.slice(0, INITIAL_INTRO_COUNT).map((card) => card.card.id));
  const [studyIndex, setStudyIndex] = useState(0);
  const [quizCards, setQuizCards] = useState<KanaStudyCard[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [pendingGrade, setPendingGrade] = useState<SrsGrade | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [totals, setTotals] = useState({ correct: 0, wrong: 0, responseTimeMs: 0, weakFound: 0 });
  const [sessionCorrectCounts, setSessionCorrectCounts] = useState<Record<string, number>>({});

  const cardMap = useMemo(() => new Map(cards.map((card) => [card.card.id, card])), [cards]);
  const introducedSet = useMemo(() => new Set(introducedIds), [introducedIds]);
  const studyQueue = useMemo(
    () => studyQueueIds.map((id) => cardMap.get(id)).filter(Boolean) as KanaStudyCard[],
    [cardMap, studyQueueIds],
  );
  const currentStudyCard = studyQueue[studyIndex] ?? null;
  const currentQuizCard = quizCards[quizIndex] ?? null;

  const effectiveCorrectCount = (cardId: string) => {
    const base = progress.cards[cardId]?.correctCount ?? 0;
    const local = sessionCorrectCounts[cardId] ?? 0;
    return base + local;
  };

  const buildQuizPool = (ids: string[]) => shuffleItems(ids.map((id) => cardMap.get(id)).filter(Boolean) as KanaStudyCard[]);

  useEffect(() => {
    if (currentStudyCard) {
      playKanaAudio(currentStudyCard, player);
    }
  }, [currentStudyCard, player]);

  useEffect(() => {
    if (phase !== "quiz" || !currentQuizCard) return;
    setSelected(null);
    setRevealed(false);
    setPendingGrade(null);
    setStartTime(Date.now());
  }, [currentQuizCard, phase]);

  useEffect(() => {
    if (phase !== "quiz" || !pendingGrade) return;
    const timeout = window.setTimeout(() => {
      finishQuizStep(pendingGrade);
    }, pendingGrade === "good" ? 350 : 700);
    return () => window.clearTimeout(timeout);
  }, [pendingGrade, phase]);

  useEffect(() => {
    const allowedIds = new Set(cards.map((card) => card.card.id));
    setIntroducedIds((current) => {
      const filtered = current.filter((id) => allowedIds.has(id));
      return sameIds(current, filtered) ? current : filtered;
    });
    setStudyQueueIds((current) => {
      const filtered = current.filter((id) => allowedIds.has(id));
      if (filtered.length) return sameIds(current, filtered) ? current : filtered;
      if (!cards.length) return [];
      const introducedStillValid = introducedIds.filter((id) => allowedIds.has(id));
      if (!introducedStillValid.length) {
        const initial = cards.slice(0, INITIAL_INTRO_COUNT).map((card) => card.card.id);
        return sameIds(current, initial) ? current : initial;
      }
      return current.length === 0 ? current : [];
    });
  }, [cards, introducedIds]);

  useEffect(() => {
    if (phase !== "study" || currentStudyCard || !cards.length) return;
    const initialIds = introducedIds.length ? introducedIds : cards.slice(0, INITIAL_INTRO_COUNT).map((card) => card.card.id);
    if (!introducedIds.length) {
      setIntroducedIds(initialIds);
    }
    const nextQuizCards = buildQuizPool(initialIds);
    setQuizCards(nextQuizCards);
    setQuizIndex(0);
    setPhase("quiz");
  }, [cards, currentStudyCard, introducedIds, phase]);

  const finishSessionAndExit = () => {
    const answered = totals.correct + totals.wrong;
    if (answered > 0) {
      onComplete({
        correct: totals.correct,
        wrong: totals.wrong,
        averageTimeMs: Math.round(totals.responseTimeMs / answered),
        weakFound: totals.weakFound,
        cards: answered,
      });
    }
    onDone();
  };

  if (!cards.length) {
    return (
      <section className="panel">
        <h2>{title}</h2>
        <p className="empty-copy">{t("noCardsAvailable")}</p>
        <button className="secondary" type="button" onClick={finishSessionAndExit}>
          {t("back")}
        </button>
      </section>
    );
  }

  const startQuiz = (nextIntroducedIds: string[]) => {
    const nextQuizCards = buildQuizPool(nextIntroducedIds);
    setQuizCards(nextQuizCards);
    setQuizIndex(0);
    setPhase("quiz");
  };

  const finishQuizStep = (grade: SrsGrade) => {
    if (!currentQuizCard || !prompt) return;
    const isCorrect = selected === prompt.answer && !revealed;
    const measured = Math.max(300, Date.now() - startTime);

    onAnswer(currentQuizCard, isCorrect, measured, grade);

    if (isCorrect) {
      setSessionCorrectCounts((current) => ({
        ...current,
        [currentQuizCard.card.id]: (current[currentQuizCard.card.id] ?? 0) + 1,
      }));
    }

    const nextTotals = {
      correct: totals.correct + (isCorrect ? 1 : 0),
      wrong: totals.wrong + (isCorrect ? 0 : 1),
      responseTimeMs: totals.responseTimeMs + measured,
      weakFound: totals.weakFound + (!isCorrect || grade === "again" || grade === "hard" ? 1 : 0),
    };
    setTotals(nextTotals);

    const nextIntroducedIds = introducedIds;
    const willIntroduceNext = isCorrect
      ? nextIntroducedIds.length > 0 && nextIntroducedIds.every((id) => {
        const currentCount = id === currentQuizCard.card.id
          ? effectiveCorrectCount(id) + 1
          : effectiveCorrectCount(id);
        return currentCount >= KANA_UNLOCK_TARGET;
      })
      : false;

    if (willIntroduceNext) {
      const nextCard = cards.find((card) => !nextIntroducedIds.includes(card.card.id));
      if (nextCard) {
        setStudyQueueIds([nextCard.card.id]);
        setStudyIndex(0);
        setPhase("study");
        return;
      }
    }

    if (quizIndex + 1 >= quizCards.length) {
      setQuizCards(buildQuizPool(nextIntroducedIds));
      setQuizIndex(0);
      return;
    }

    setQuizIndex((value) => value + 1);
  };

  const handleSelect = (choice: string) => {
    if (!prompt || selected || pendingGrade) return;
    setSelected(choice);
    const correct = choice === prompt.answer;
    if (correct && settings.audioEnabled && currentQuizCard) {
      playKanaAudio(currentQuizCard, player);
    }
    setPendingGrade(correct ? "good" : "again");
  };

  if (phase === "study") {
    if (!currentStudyCard) return null;

    return (
      <div className="kana-trainer">
        <header className="kana-session-header">
          <button type="button" className="icon-button" onClick={finishSessionAndExit} aria-label={t("back")}>
            ←
          </button>
        </header>
        <ProgressBar value={effectiveCorrectCount(currentStudyCard.card.id)} max={KANA_UNLOCK_TARGET} label={t("masteryProgress")} showValue={false} />
        <section className="kana-stage">
          <div className="kana-glyph" lang="ja">{currentStudyCard.card.kana}</div>
          <div className="kana-caption">
            <strong>{currentStudyCard.card.romaji}</strong>
          </div>
        </section>
        <div className="kana-toolbar">
          <button type="button" className="audio-pill" onClick={() => playKanaAudio(currentStudyCard, player)}>
            ▶
          </button>
          <button
            type="button"
            className="primary large"
            onClick={() => {
              const nextStudyIds = studyQueueIds;
              if (studyIndex + 1 < studyQueue.length) {
                setStudyIndex((value) => value + 1);
                return;
              }

              const nextIntroducedIds = Array.from(new Set([...introducedIds, ...nextStudyIds]));
              setIntroducedIds(nextIntroducedIds);
              setStudyQueueIds([]);
              setStudyIndex(0);
              startQuiz(nextIntroducedIds);
            }}
          >
            {t("nextKana")}
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuizCard) {
    return null;
  }

  const prompt = promptForCard(currentQuizCard, allCards, mode);
  const isDrawMode = Boolean(
    handwritingEnabled
    && prompt.answer === currentQuizCard.card.kana
    && prompt.prompt === currentQuizCard.card.romaji
    && introducedSet.has(currentQuizCard.card.id),
  );
  const handwritingPool = cards
    .filter((card) => introducedSet.has(card.card.id) && card.card.script === currentQuizCard.card.script)
    .map((card) => card.card.kana);
  const currentKanaProgress = Math.min(KANA_UNLOCK_TARGET, effectiveCorrectCount(currentQuizCard.card.id));
  const showAnswer = Boolean(selected || revealed);
  const answerState = selected ? (selected === prompt.answer ? "correct" : "wrong") : revealed ? "wrong" : "idle";

  return (
    <div className={`kana-trainer ${answerState !== "idle" ? `state-${answerState}` : ""}`}>
      <header className="kana-session-header">
        <button type="button" className="icon-button" onClick={finishSessionAndExit} aria-label={t("back")}>
          ←
        </button>
      </header>
      <ProgressBar value={currentKanaProgress} max={KANA_UNLOCK_TARGET} label={t("masteryProgress")} showValue={false} />
      <section className={isDrawMode ? "kana-stage draw-mode" : "kana-stage"}>
        <div className="kana-glyph" lang="ja">{prompt.prompt}</div>
      </section>
      {isDrawMode ? (
        <KanaHandwritingPad
          key={`${currentQuizCard.card.id}:${prompt.prompt}:${prompt.answer}`}
          candidates={handwritingPool}
          expectedKana={prompt.answer}
          t={t}
          disabled={Boolean(selected)}
          onMatch={handleSelect}
        />
      ) : (
        <MultipleChoice
          key={`${currentQuizCard.card.id}:${prompt.prompt}:${prompt.answer}`}
          choices={prompt.choices}
          answer={prompt.answer}
          selected={selected}
          disabled={Boolean(selected)}
          onSelect={(choice) => handleSelect(choice)}
          showKeys={false}
          compact
        />
      )}
      <div className="kana-toolbar">
        <button type="button" className="audio-pill" onClick={() => playKanaAudio(currentQuizCard, player)}>
          ▶
        </button>
        {!showAnswer && (
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (pendingGrade) return;
              setRevealed(true);
              setPendingGrade("again");
            }}
          >
            {t("iDontKnow")}
          </button>
        )}
      </div>
      {showAnswer && (
        <div className="kana-inline-answer">
          <div>
            <strong>{selected === prompt.answer && !revealed ? t("correct") : t("answer")}</strong>
            <p lang="ja">{prompt.answer}</p>
            <small>{currentQuizCard.card.romaji}</small>
          </div>
        </div>
      )}
    </div>
  );
}
