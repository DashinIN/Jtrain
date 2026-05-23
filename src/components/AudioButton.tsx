import type { AudioMeta } from "../types/cards";
import type { UserSettings } from "../types/settings";
import { useAudio } from "../hooks/useAudio";

interface Props {
  text: string;
  audio?: AudioMeta;
  settings: UserSettings;
}

export function AudioButton({ text, audio, settings }: Props) {
  const player = useAudio(settings);

  const handleClick = () => {
    if (!settings.audioEnabled) return;
    if (player.isPlaying) {
      player.stop();
      return;
    }
    if (audio?.src) player.playLocalAudio(audio.src, text);
    else player.speakWithWebSpeech(text);
  };

  return (
    <button
      type="button"
      className={player.error ? "audio-button error" : "audio-button"}
      onClick={handleClick}
      disabled={!settings.audioEnabled}
      title={player.error ?? (player.hasJapaneseVoice ? "Play Japanese audio" : "Play with Web Speech fallback")}
    >
      {player.isPlaying ? "■" : "▶"}
    </button>
  );
}
