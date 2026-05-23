import { useMemo, useState } from "react";
import type { StudyCard } from "../types/cards";
import type { ProgressStore, SrsGrade } from "../types/srs";
import type { UserSettings } from "../types/settings";
import type { createTranslator } from "../i18n/translations";
import { kanaCards } from "../data/kana";
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

export function KanaScreen({ allCards, progress, settings, t, onAnswer, onSessionComplete }: Props) {
  const [mode, setMode] = useState("mixed");
  const [script, setScript] = useState("both");
  const [category, setCategory] = useState("all");
  const [weakOnly, setWeakOnly] = useState(false);
  const [active, setActive] = useState<StudyCard[] | null>(null);

  const filtered = useMemo(() => {
    return kanaCards
      .filter((card) => script === "both" || card.script === script)
      .filter((card) => category === "all" || card.category === category)
      .filter((card) => mode !== "similar" || card.similarTo?.length)
      .filter((card) => !weakOnly || progress.cards[card.id]?.isWeak)
      .map((card) => ({ type: "kana" as const, card }));
  }, [category, mode, progress.cards, script, weakOnly]);

  if (active) {
    return (
      <SessionRunner
        title={t("kanaTraining")}
        cards={active}
        allCards={allCards}
        settings={settings}
        t={t}
        mode={mode}
        onAnswer={onAnswer}
        onComplete={onSessionComplete}
        onDone={() => setActive(null)}
        onTrainWeak={() => setActive(filtered.filter((item) => progress.cards[item.card.id]?.isWeak))}
      />
    );
  }

  const weakStates = Object.values(progress.cards).filter((state) => state.type === "kana" && state.isWeak);

  return (
    <div className="screen-stack">
      <section className="panel controls-panel">
        <h2>{t("kana")}</h2>
        <div className="control-grid">
          <label>{t("mode")}<select value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="kana-romaji">{t("kanaToRomaji")}</option>
            <option value="romaji-kana">{t("romajiToKana")}</option>
            <option value="mixed">{t("mixedKana")}</option>
            <option value="speed">{t("speedDrill")}</option>
            <option value="similar">{t("similarKana")}</option>
          </select></label>
          <label>{t("script")}<select value={script} onChange={(event) => setScript(event.target.value)}>
            <option value="both">{t("bothScripts")}</option>
            <option value="hiragana">{t("hiragana")}</option>
            <option value="katakana">{t("katakana")}</option>
          </select></label>
          <label>{t("category")}<select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">{t("allCategories")}</option>
            <option value="basic">{t("basic")}</option>
            <option value="dakuten">{t("dakuten")}</option>
            <option value="handakuten">{t("handakuten")}</option>
            <option value="yoon">{t("yoon")}</option>
            <option value="small-tsu">{t("smallTsu")}</option>
            <option value="long-vowel">{t("longVowels")}</option>
          </select></label>
          <label className="inline-check"><input type="checkbox" checked={weakOnly} onChange={(event) => setWeakOnly(event.target.checked)} /> {t("onlyWeakKana")}</label>
        </div>
        <button className="primary large" type="button" onClick={() => setActive(filtered.slice(0, mode === "speed" ? 30 : 24))}>{t("startKanaDrill")}</button>
      </section>
      <section className="panel">
        <h2>{t("categoryNotes")}</h2>
        <div className="note-grid">
          {[
            ["dakuten", t("kanaDakutenNote")],
            ["handakuten", t("kanaHandakutenNote")],
            ["yoon", t("kanaYoonNote")],
            ["small-tsu", t("kanaSmallTsuNote")],
            ["long-vowel", t("kanaLongVowelNote")],
          ].map(([key, note]) => <article key={key}><strong>{key}</strong><p>{note}</p></article>)}
        </div>
      </section>
      <section className="panel">
        <h2>{t("kanaErrors")}</h2>
        <WeakSpotList states={weakStates} cards={allCards} t={t} />
      </section>
    </div>
  );
}
