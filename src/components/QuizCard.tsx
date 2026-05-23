import type { ReactNode } from "react";
import type { AudioMeta } from "../types/cards";
import type { UserSettings } from "../types/settings";
import { AudioButton } from "./AudioButton";

interface Props {
  label: string;
  prompt: string;
  audioText: string;
  audio?: AudioMeta;
  settings: UserSettings;
  state?: "idle" | "correct" | "wrong";
  children: ReactNode;
}

export function QuizCard({ label, prompt, audioText, audio, settings, state = "idle", children }: Props) {
  return (
    <section className={`quiz-card ${state}`}>
      <div className="quiz-topline">
        <span className="pill">{label}</span>
        <AudioButton text={audioText} audio={audio} settings={settings} />
      </div>
      <div className="quiz-prompt" lang="ja">{prompt}</div>
      {children}
    </section>
  );
}
