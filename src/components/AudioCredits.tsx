import type { StudyCard } from "../types/cards";
import type { createTranslator } from "../i18n/translations";

interface Props {
  cards: StudyCard[];
  t: ReturnType<typeof createTranslator>;
}

export function AudioCredits({ cards, t }: Props) {
  const credits = cards
    .map((item) => ({ id: item.card.id, audio: item.card.audio }))
    .filter((item) => item.audio);

  return (
    <section className="panel">
      <h2>{t("audioCredits")}</h2>
      <p className="muted-copy">{t("audioCreditsCopy")}</p>
      <div className="credits-list">
        {credits.slice(0, 80).map(({ id, audio }) => (
          <article key={id}>
            <strong>{id}</strong>
            <span>{audio?.source}</span>
            <span>{audio?.license ?? "License not set"}</span>
            {audio?.url && <a href={audio.url} target="_blank" rel="noreferrer">{t("original")}</a>}
          </article>
        ))}
      </div>
    </section>
  );
}
