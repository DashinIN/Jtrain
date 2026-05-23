import type { UserSettings } from "../types/settings";
import { useLocalStorage } from "./useLocalStorage";

export const defaultSettings: UserSettings = {
  theme: "dark",
  darkMode: true,
  accentColor: "#55c7b5",
  language: "en",
  dailyNewCards: 8,
  timerEnabled: true,
  showRomaji: true,
  furiganaMode: "on-tap",
  audioEnabled: true,
  autoplayAfterAnswer: false,
  fallbackWebSpeech: true,
  speechRate: "normal",
  preferKanaReadingForWordAudio: true,
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<UserSettings>("jtrain-settings", defaultSettings);
  return { settings: { ...defaultSettings, ...settings }, setSettings };
}
