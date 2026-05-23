import type { ChangeEvent } from "react";
import type { ProgressStore } from "../types/srs";
import type { UserSettings } from "../types/settings";
import { languageNames, type createTranslator } from "../i18n/translations";

interface Props {
  settings: UserSettings;
  onChange: (settings: UserSettings) => void;
  progress: ProgressStore;
  onImportProgress: (progress: ProgressStore) => void;
  onResetRequest: () => void;
  t: ReturnType<typeof createTranslator>;
}

export function SettingsPanel({ settings, onChange, progress, onImportProgress, onResetRequest, t }: Props) {
  const update = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => onChange({ ...settings, [key]: value });
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "jtrain-progress.json";
    link.click();
    URL.revokeObjectURL(url);
  };
  const importJson = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        onImportProgress(JSON.parse(String(reader.result)) as ProgressStore);
      } catch {
        window.alert("Could not import progress JSON.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <section className="panel settings-grid">
      <label>
        {t("theme")}
        <select value={settings.theme} onChange={(event) => update("theme", event.target.value as UserSettings["theme"])}>
          <option value="dark">{t("dark")}</option>
          <option value="light">{t("light")}</option>
          <option value="system">{t("system")}</option>
        </select>
      </label>
      <label>
        {t("accentColor")}
        <input type="color" value={settings.accentColor} onChange={(event) => update("accentColor", event.target.value)} />
      </label>
      <label>
        {t("language")}
        <select value={settings.language} onChange={(event) => update("language", event.target.value as UserSettings["language"])}>
          {Object.entries(languageNames).map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
      </label>
      <label>
        {t("dailyNewCards")}
        <input
          type="number"
          min={0}
          max={20}
          value={settings.dailyNewCards}
          onChange={(event) => update("dailyNewCards", Number(event.target.value))}
        />
      </label>
      <label><input type="checkbox" checked={settings.timerEnabled} onChange={(event) => update("timerEnabled", event.target.checked)} /> {t("enableTimer")}</label>
      <label><input type="checkbox" checked={settings.showRomaji} onChange={(event) => update("showRomaji", event.target.checked)} /> {t("showRomaji")}</label>
      <label>
        {t("furiganaMode")}
        <select value={settings.furiganaMode} onChange={(event) => update("furiganaMode", event.target.value as UserSettings["furiganaMode"])}>
          <option value="always">{t("always")}</option>
          <option value="after-answer">{t("afterAnswer")}</option>
          <option value="on-tap">{t("onTap")}</option>
          <option value="never">{t("never")}</option>
        </select>
      </label>
      <label><input type="checkbox" checked={settings.audioEnabled} onChange={(event) => update("audioEnabled", event.target.checked)} /> {t("audioEnabled")}</label>
      <label><input type="checkbox" checked={settings.autoplayAfterAnswer} onChange={(event) => update("autoplayAfterAnswer", event.target.checked)} /> {t("autoplayAfterAnswer")}</label>
      <label><input type="checkbox" checked={settings.fallbackWebSpeech} onChange={(event) => update("fallbackWebSpeech", event.target.checked)} /> {t("webSpeechFallback")}</label>
      <label>
        {t("fallbackSpeechRate")}
        <select value={settings.speechRate} onChange={(event) => update("speechRate", event.target.value as UserSettings["speechRate"])}>
          <option value="slow">{t("slow")}</option>
          <option value="normal">{t("normal")}</option>
          <option value="fast">{t("fast")}</option>
        </select>
      </label>
      <label><input type="checkbox" checked={settings.preferKanaReadingForWordAudio} onChange={(event) => update("preferKanaReadingForWordAudio", event.target.checked)} /> {t("preferKanaReading")}</label>
      <div className="settings-actions">
        <button className="secondary" type="button" onClick={exportJson}>{t("exportProgress")}</button>
        <label className="file-button">
          {t("importProgress")}
          <input type="file" accept="application/json" onChange={importJson} />
        </label>
        <button className="danger" type="button" onClick={onResetRequest}>{t("resetProgress")}</button>
      </div>
    </section>
  );
}
