export interface UserSettings {
  theme: "light" | "dark" | "system";
  darkMode: boolean;
  accentColor: string;
  language: "en" | "ru" | "ja" | "es" | "de" | "fr" | "zh" | "ko" | "pt";
  dailyNewCards: number;
  timerEnabled: boolean;
  showRomaji: boolean;
  furiganaMode: "always" | "after-answer" | "on-tap" | "never";
  audioEnabled: boolean;
  autoplayAfterAnswer: boolean;
  fallbackWebSpeech: boolean;
  speechRate: "slow" | "normal" | "fast";
  preferKanaReadingForWordAudio: boolean;
}
