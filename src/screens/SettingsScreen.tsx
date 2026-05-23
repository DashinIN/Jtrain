import { useState } from "react";
import type { StudyCard } from "../types/cards";
import type { ProgressStore } from "../types/srs";
import type { UserSettings } from "../types/settings";
import type { createTranslator } from "../i18n/translations";
import { AudioCredits } from "../components/AudioCredits";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SettingsPanel } from "../components/SettingsPanel";

interface Props {
  allCards: StudyCard[];
  settings: UserSettings;
  progress: ProgressStore;
  onSettingsChange: (settings: UserSettings) => void;
  onImportProgress: (progress: ProgressStore) => void;
  onResetProgress: () => void;
  t: ReturnType<typeof createTranslator>;
}

export function SettingsScreen({ allCards, settings, progress, onSettingsChange, onImportProgress, onResetProgress, t }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <div className="screen-stack">
      <SettingsPanel
        settings={settings}
        onChange={onSettingsChange}
        progress={progress}
        onImportProgress={onImportProgress}
        onResetRequest={() => setConfirmOpen(true)}
        t={t}
      />
      <AudioCredits cards={allCards} t={t} />
      <ConfirmDialog
        open={confirmOpen}
        title={t("resetTitle")}
        message={t("resetMessage")}
        cancelLabel={t("cancel")}
        confirmLabel={t("reset")}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          onResetProgress();
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
