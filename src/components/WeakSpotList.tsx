import type { StudyCard } from "../types/cards";
import type { SrsState } from "../types/srs";
import type { Translator } from "../i18n/translations";

interface Props {
  states: SrsState[];
  cards: StudyCard[];
  t: Translator;
}

function labelFor(card: StudyCard | undefined) {
  if (!card) return "Unknown card";
  if (card.type === "kana") return `${card.card.kana} (${card.card.romaji})`;
  if (card.type === "kanji") return `${card.card.kanji} - ${card.card.meaning}`;
  if (card.type === "word") return `${card.card.word} / ${card.card.reading}`;
  if (card.type === "particle") return card.card.blankSentence;
  return card.card.japanese;
}

export function WeakSpotList({ states, cards, t }: Props) {
  if (!states.length) return <p className="empty-copy">{t("noWeakSpots")}</p>;
  return (
    <div className="weak-list">
      {states.map((state) => {
        const card = cards.find((item) => item.card.id === state.id);
        const reason = state.wrongCount > 0 ? t("wrong") : state.slowCount > 0 ? t("slow") : t("hard");
        return (
          <article className="weak-item" key={state.id}>
            <div>
              <span className="pill">{state.type}</span>
              <h3>{labelFor(card)}</h3>
              <p>{t("reason")}: {reason}</p>
            </div>
            <dl>
              <div><dt>{t("wrong")}</dt><dd>{state.wrongCount}</dd></div>
              <div><dt>{t("avgTime")}</dt><dd>{Math.round(state.averageTimeMs / 100) / 10}s</dd></div>
              <div><dt>{t("lastSeen")}</dt><dd>{state.lastSeen ?? t("neverSeen")}</dd></div>
            </dl>
          </article>
        );
      })}
    </div>
  );
}
