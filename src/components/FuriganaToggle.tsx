import type { Translator } from "../i18n/translations";

interface Props {
  visible: boolean;
  onToggle: () => void;
  t: Translator;
}

export function FuriganaToggle({ visible, onToggle, t }: Props) {
  return (
    <button type="button" className="secondary" onClick={onToggle}>
      {visible ? t("hideFurigana") : t("showFurigana")}
    </button>
  );
}
