import type { StudyCard } from "../types/cards";
import { shuffle } from "./shuffle";

export interface QuizPrompt {
  id: string;
  type: StudyCard["type"];
  prompt: string;
  answer: string;
  choices: string[];
  label: string;
  explanation?: string;
  audioText: string;
}

export type WordExercise = "word-reading" | "word-meaning" | "reading-word" | "meaning-word";
export type KanaExercise = "kana-romaji" | "romaji-kana" | "mixed" | "speed" | "similar";

export function makeChoices(correct: string, pool: string[], count = 4): string[] {
  return shuffle([correct, ...shuffle(pool.filter((item) => item !== correct)).slice(0, count - 1)]);
}

export function promptForCard(card: StudyCard, allCards: StudyCard[], mode = "mixed"): QuizPrompt {
  if (card.type === "kana") {
    const allKana = allCards.filter((item) => item.type === "kana").map((item) => item.card);
    const direction = mode === "romaji-kana" ? "romaji-kana" : mode === "mixed" && Math.random() > 0.5 ? "romaji-kana" : "kana-romaji";
    const prompt = direction === "romaji-kana" ? card.card.romaji : card.card.kana;
    const answer = direction === "romaji-kana" ? card.card.kana : card.card.romaji;
    const pool = allKana.map((item) => (direction === "romaji-kana" ? item.kana : item.romaji));
    return {
      id: card.card.id,
      type: "kana",
      prompt,
      answer,
      choices: makeChoices(answer, pool),
      label: direction === "romaji-kana" ? "romaji -> kana" : "kana -> romaji",
      audioText: card.card.kana,
    };
  }

  if (card.type === "word") {
    const words = allCards.filter((item) => item.type === "word").map((item) => item.card);
    const exercise = mode as WordExercise;
    const prompt =
      exercise === "reading-word"
        ? card.card.reading
        : exercise === "meaning-word"
          ? card.card.meaning
          : card.card.word;
    const answer =
      exercise === "word-reading"
        ? card.card.reading
        : exercise === "word-meaning"
          ? card.card.meaning
          : card.card.word;
    const pool = words.map((item) =>
      exercise === "word-reading" ? item.reading : exercise === "word-meaning" ? item.meaning : item.word,
    );
    return {
      id: card.card.id,
      type: "word",
      prompt,
      answer,
      choices: makeChoices(answer, pool),
      label: exercise.replace("-", " -> "),
      explanation: `${card.card.word} / ${card.card.reading} = ${card.card.meaning}`,
      audioText: card.card.word,
    };
  }

  if (card.type === "kanji") {
    const kanji = allCards.filter((item) => item.type === "kanji").map((item) => item.card);
    const reading = [...card.card.kunyomi, ...card.card.onyomi][0] ?? "";
    const exercise = mode === "kanji-reading" ? "kanji-reading" : mode === "kanji-components" ? "kanji-components" : "kanji-meaning";
    const answer =
      exercise === "kanji-reading"
        ? reading
        : exercise === "kanji-components"
          ? card.card.components.length ? card.card.components.join(" + ") : "primitive"
          : card.card.meaning;
    const pool =
      exercise === "kanji-reading"
        ? kanji.map((item) => [...item.kunyomi, ...item.onyomi][0] ?? "")
        : exercise === "kanji-components"
          ? kanji.map((item) => (item.components.length ? item.components.join(" + ") : "primitive"))
          : kanji.map((item) => item.meaning);
    return {
      id: card.card.id,
      type: "kanji",
      prompt: card.card.kanji,
      answer,
      choices: makeChoices(answer, pool),
      label: exercise.replace("-", " -> "),
      explanation: `${card.card.kanji}: ${card.card.etymology}`,
      audioText: card.card.kanji,
    };
  }

  if (card.type === "particle") {
    return {
      id: card.card.id,
      type: "particle",
      prompt: card.card.blankSentence,
      answer: card.card.correctParticle,
      choices: shuffle(card.card.options),
      label: "Fill the particle",
      explanation: card.card.explanation,
      audioText: card.card.sentence,
    };
  }

  return {
    id: card.card.id,
    type: "sentence",
    prompt: card.card.japanese,
    answer: card.card.translation,
    choices: ["Again", "Hard", "Good", "Easy"],
    label: "Self grade sentence",
    explanation: card.card.translation,
    audioText: card.card.japanese,
  };
}
