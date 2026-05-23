import { useEffect, useState } from "react";
import { AppLayout } from "./components/AppLayout";
import { allStudyCards } from "./data/allCards";
import { useSettings } from "./hooks/useSettings";
import { useSrsProgress } from "./hooks/useSrsProgress";
import { createTranslator } from "./i18n/translations";
import type { StudyCard } from "./types/cards";
import type { SrsGrade } from "./types/srs";
import type { TabId } from "./types/navigation";
import { TodayScreen } from "./screens/TodayScreen";
import { KanaScreen } from "./screens/KanaScreen";
import { KanjiScreen } from "./screens/KanjiScreen";
import { WordsScreen } from "./screens/WordsScreen";
import { SentencesScreen } from "./screens/SentencesScreen";
import { ParticlesScreen } from "./screens/ParticlesScreen";
import { WeakSpotsScreen } from "./screens/WeakSpotsScreen";
import { StatsScreen } from "./screens/StatsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";

function contrastText(hex: string) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return "#ffffff";
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58 ? "#101414" : "#ffffff";
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabId>("today");
  const { settings, setSettings } = useSettings();
  const progressApi = useSrsProgress();
  const t = createTranslator(settings.language);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const resolvedTheme = settings.theme === "system" ? (media.matches ? "dark" : "light") : settings.theme;
      document.documentElement.dataset.theme = resolvedTheme;
      document.documentElement.style.setProperty("--primary", settings.accentColor);
      document.documentElement.style.setProperty("--primary-contrast", contrastText(settings.accentColor));
    };
    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [settings.accentColor, settings.theme]);

  const handleAnswer = (card: StudyCard, isCorrect: boolean, responseTimeMs: number, grade: SrsGrade) => {
    progressApi.updateAfterAnswer({
      cardId: card.card.id,
      type: card.type,
      isCorrect,
      responseTimeMs,
      grade,
    });
  };

  const handleSessionComplete = (summary: { correct: number; wrong: number; averageTimeMs: number; cards: number }) => {
    progressApi.addSessionLog(summary);
  };

  return (
    <AppLayout currentTab={currentTab} onTabChange={setCurrentTab} t={t}>
      {currentTab === "today" && (
        <TodayScreen
          allCards={allStudyCards}
          progress={progressApi.progress}
          settings={settings}
          t={t}
          onAnswer={handleAnswer}
          onSessionComplete={handleSessionComplete}
        />
      )}
      {currentTab === "kana" && (
        <KanaScreen
          allCards={allStudyCards}
          progress={progressApi.progress}
          settings={settings}
          t={t}
          onAnswer={handleAnswer}
          onSessionComplete={handleSessionComplete}
        />
      )}
      {currentTab === "kanji" && (
        <KanjiScreen
          allCards={allStudyCards}
          progress={progressApi.progress}
          settings={settings}
          t={t}
          onAnswer={handleAnswer}
          onSessionComplete={handleSessionComplete}
        />
      )}
      {currentTab === "words" && (
        <WordsScreen
          allCards={allStudyCards}
          progress={progressApi.progress}
          settings={settings}
          t={t}
          onAnswer={handleAnswer}
          onSessionComplete={handleSessionComplete}
        />
      )}
      {currentTab === "sentences" && (
        <SentencesScreen allCards={allStudyCards} settings={settings} t={t} onAnswer={handleAnswer} onSessionComplete={handleSessionComplete} />
      )}
      {currentTab === "particles" && (
        <ParticlesScreen
          allCards={allStudyCards}
          progress={progressApi.progress}
          settings={settings}
          t={t}
          onAnswer={handleAnswer}
          onSessionComplete={handleSessionComplete}
        />
      )}
      {currentTab === "weak" && (
        <WeakSpotsScreen
          allCards={allStudyCards}
          progress={progressApi.progress}
          settings={settings}
          t={t}
          onAnswer={handleAnswer}
          onSessionComplete={handleSessionComplete}
        />
      )}
      {currentTab === "stats" && <StatsScreen allCards={allStudyCards} progress={progressApi.progress} t={t} />}
      {currentTab === "settings" && (
        <SettingsScreen
          allCards={allStudyCards}
          settings={settings}
          t={t}
          progress={progressApi.progress}
          onSettingsChange={setSettings}
          onImportProgress={progressApi.importProgress}
          onResetProgress={progressApi.resetProgress}
        />
      )}
    </AppLayout>
  );
}
