import { useEffect } from "react";

interface ShortcutHandlers {
  onChoice?: (index: number) => void;
  onSpace?: () => void;
  onEnter?: () => void;
  onGrade?: (grade: "again" | "hard" | "good" | "easy") => void;
  onFurigana?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({ onChoice, onSpace, onEnter, onGrade, onFurigana, enabled = true }: ShortcutHandlers) {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (["1", "2", "3", "4"].includes(event.key)) onChoice?.(Number(event.key) - 1);
      if (event.code === "Space") {
        event.preventDefault();
        onSpace?.();
      }
      if (event.key === "Enter") onEnter?.();
      if (event.key.toLowerCase() === "a") onGrade?.("again");
      if (event.key.toLowerCase() === "h") onGrade?.("hard");
      if (event.key.toLowerCase() === "g") onGrade?.("good");
      if (event.key.toLowerCase() === "e") onGrade?.("easy");
      if (event.key.toLowerCase() === "f") onFurigana?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onChoice, onEnter, onFurigana, onGrade, onSpace]);
}
