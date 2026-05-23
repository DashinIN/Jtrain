import type { SrsGrade } from "../types/srs";
import type { Translator } from "../i18n/translations";

interface Props {
  onGrade: (grade: SrsGrade) => void;
  t: Translator;
}

export function SrsButtons({ onGrade, t }: Props) {
  return (
    <div className="srs-buttons">
      <button type="button" className="danger" onClick={() => onGrade("again")}>{t("again")}</button>
      <button type="button" className="warning" onClick={() => onGrade("hard")}>{t("hard")}</button>
      <button type="button" className="success" onClick={() => onGrade("good")}>{t("good")}</button>
      <button type="button" className="primary" onClick={() => onGrade("easy")}>{t("easy")}</button>
    </div>
  );
}
