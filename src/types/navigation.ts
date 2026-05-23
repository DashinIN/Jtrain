export type TabId = "today" | "kana" | "kanji" | "words" | "sentences" | "particles" | "weak" | "stats" | "settings";

export const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: "today", label: "Today", icon: "今日" },
  { id: "kana", label: "Kana", icon: "あ" },
  { id: "kanji", label: "Kanji", icon: "字" },
  { id: "words", label: "Words", icon: "語" },
  { id: "sentences", label: "Sentences", icon: "文" },
  { id: "particles", label: "Particles", icon: "は" },
  { id: "weak", label: "Weak Spots", icon: "!" },
  { id: "stats", label: "Stats", icon: "%" },
  { id: "settings", label: "Settings", icon: "⚙" },
];
