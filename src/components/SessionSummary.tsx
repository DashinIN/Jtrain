import type { Translator } from "../i18n/translations";

interface Props {
  correct: number;
  wrong: number;
  averageTimeMs: number;
  weakFound: number;
  onTrainWeak: () => void;
  onDone: () => void;
  t: Translator;
}

export function SessionSummary({ correct, wrong, averageTimeMs, weakFound, onTrainWeak, onDone, t }: Props) {
  return (
    <section className="panel">
      <h2>{t("sessionSummary")}</h2>
      <div className="stats-grid">
        <div><span>{t("correct")}</span><strong>{correct}</strong></div>
        <div><span>{t("wrong")}</span><strong>{wrong}</strong></div>
        <div><span>{t("averageTime")}</span><strong>{Math.round(averageTimeMs / 100) / 10}s</strong></div>
        <div><span>{t("weakSpotsFound")}</span><strong>{weakFound}</strong></div>
      </div>
      <div className="action-row">
        <button type="button" className="primary" onClick={onTrainWeak}>{t("trainWeakSpots")}</button>
        <button type="button" className="secondary" onClick={onDone}>{t("done")}</button>
      </div>
    </section>
  );
}
