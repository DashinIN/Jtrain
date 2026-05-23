import { useMemo, useState } from "react";
import type { StudyCard } from "../types/cards";
import type { ProgressStore, SrsGrade } from "../types/srs";
import type { UserSettings } from "../types/settings";
import type { createTranslator } from "../i18n/translations";
import { findKanji, kanjiCards } from "../data/kanji";
import { SessionRunner } from "../components/SessionRunner";
import { WeakSpotList } from "../components/WeakSpotList";
import { kanjiLearningNote } from "../utils/localizedContent";

interface Props {
  allCards: StudyCard[];
  progress: ProgressStore;
  settings: UserSettings;
  t: ReturnType<typeof createTranslator>;
  onAnswer: (card: StudyCard, isCorrect: boolean, responseTimeMs: number, grade: SrsGrade) => void;
  onSessionComplete: (summary: { correct: number; wrong: number; averageTimeMs: number; weakFound: number; cards: number }) => void;
}

function isReady(kanji: string, progress: ProgressStore) {
  const card = findKanji(kanji);
  if (!card || card.components.length === 0) return true;
  return card.components.every((component) => {
    const source = findKanji(component);
    return !source || (progress.cards[source.id]?.correctCount ?? 0) > 0;
  });
}

export function KanjiScreen({ allCards, progress, settings, t, onAnswer, onSessionComplete }: Props) {
  const [mode, setMode] = useState("kanji-meaning");
  const [weakOnly, setWeakOnly] = useState(false);
  const [readyOnly, setReadyOnly] = useState(false);
  const [selectedKanji, setSelectedKanji] = useState(kanjiCards[0].kanji);
  const [active, setActive] = useState<StudyCard[] | null>(null);

  const filtered = useMemo(() => {
    return kanjiCards
      .filter((card) => !weakOnly || progress.cards[card.id]?.isWeak)
      .filter((card) => !readyOnly || isReady(card.kanji, progress))
      .map((card) => ({ type: "kanji" as const, card }));
  }, [progress, readyOnly, weakOnly]);

  const selected = findKanji(selectedKanji) ?? kanjiCards[0];
  const weakStates = Object.values(progress.cards).filter((state) => state.type === "kanji" && state.isWeak);

  if (active) {
    return (
      <SessionRunner
        title={t("kanjiTraining")}
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

  return (
    <div className="screen-stack">
      <section className="panel controls-panel">
        <h2>{t("kanji")}</h2>
        <p className="muted-copy">{t("kanjiPathCopy")}</p>
        <div className="control-grid">
          <label>{t("exercise")}<select value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="kanji-meaning">{t("kanjiToMeaning")}</option>
            <option value="kanji-reading">{t("kanjiToReading")}</option>
            <option value="kanji-components">{t("kanjiToComponents")}</option>
          </select></label>
          <label className="inline-check"><input type="checkbox" checked={readyOnly} onChange={(event) => setReadyOnly(event.target.checked)} /> {t("onlyReadyKanji")}</label>
          <label className="inline-check"><input type="checkbox" checked={weakOnly} onChange={(event) => setWeakOnly(event.target.checked)} /> {t("onlyWeakKanji")}</label>
        </div>
        <button className="primary large" type="button" onClick={() => setActive(filtered.slice(0, 20))}>{t("startKanjiDrill")}</button>
      </section>

      <section className="kanji-layout">
        <div className="panel kanji-path">
          <h2>{t("learningOrder")}</h2>
          {kanjiCards.map((card) => {
            const state = progress.cards[card.id];
            return (
              <button
                key={card.id}
                type="button"
                className={selected.kanji === card.kanji ? "kanji-path-item active" : "kanji-path-item"}
                onClick={() => setSelectedKanji(card.kanji)}
              >
                <span>{card.order}</span>
                <strong lang="ja">{card.kanji}</strong>
                <small>{card.meaning}</small>
                <em>{state?.correctCount ? t("seen") : isReady(card.kanji, progress) ? t("ready") : t("afterComponents")}</em>
              </button>
            );
          })}
        </div>

        <article className="panel kanji-detail">
          <div className="kanji-hero">
            <div className="kanji-glyph" lang="ja">{selected.kanji}</div>
            <div>
              <p className="eyebrow">#{selected.order} · {selected.strokeCount} {t("strokes")} · {selected.level}</p>
              <h2>{selected.meaning}</h2>
              <p>{kanjiLearningNote(selected, t)}</p>
            </div>
          </div>
          <div className="kanji-facts">
            <div><span>{t("onyomi")}</span><strong>{selected.onyomi.join(", ")}</strong></div>
            <div><span>{t("kunyomi")}</span><strong>{selected.kunyomi.join(", ")}</strong></div>
            <div><span>{t("components")}</span><strong>{selected.components.length ? selected.components.join(" + ") : t("primitive")}</strong></div>
            <div><span>{t("builds")}</span><strong>{selected.builds.length ? selected.builds.join(", ") : t("noneInMvpSet")}</strong></div>
            <div><span>{t("grade")}</span><strong>{selected.grade ?? "-"}</strong></div>
            <div><span>{t("frequency")}</span><strong>{selected.frequencyRank ?? "-"}</strong></div>
          </div>
          <section>
            <h3>{t("learningNote")}</h3>
            <p>{kanjiLearningNote(selected, t)}</p>
          </section>
          <section>
            <h3>{t("componentChain")}</h3>
            <div className="component-chain">
              {(selected.components.length ? selected.components : [selected.kanji]).map((component) => {
                const source = findKanji(component);
                return (
                  <div key={component}>
                    <strong lang="ja">{component}</strong>
                    <span>{source?.meaning ?? t("primitiveComponent")}</span>
                  </div>
                );
              })}
            </div>
          </section>
          <section>
            <h3>{t("exampleSentence")}</h3>
            {selected.exampleSentence && (
              <div className="sentence-example">
                <strong lang="ja">{selected.exampleSentence.japanese}</strong>
                <span>{selected.exampleSentence.translations?.[settings.language] ?? selected.exampleSentence.translation}</span>
                <small>{selected.exampleSentence.attribution} · {selected.exampleSentence.license}</small>
              </div>
            )}
          </section>
          <section>
            <h3>{t("exampleWords")}</h3>
            <div className="example-list">
              {selected.examples.map((example) => (
                <div key={example.word}>
                  <strong lang="ja">{example.word}</strong>
                  <span>{example.reading}</span>
                  <small>{example.meaning}</small>
                </div>
              ))}
            </div>
          </section>
        </article>
      </section>

      <section className="panel">
        <h2>{t("kanjiWeakSpots")}</h2>
        <WeakSpotList states={weakStates} cards={allCards} t={t} />
      </section>
    </div>
  );
}
