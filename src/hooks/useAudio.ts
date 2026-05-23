import { useCallback, useEffect, useRef, useState } from "react";
import type { UserSettings } from "../types/settings";

const rateMap = { slow: 0.72, normal: 0.92, fast: 1.12 };

export function useAudio(settings: UserSettings) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const hasJapaneseVoice = voices.some((voice) => voice.lang.startsWith("ja"));

  useEffect(() => {
    if (!isSupported) return;
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [isSupported]);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (isSupported) window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, [isSupported]);

  const speakWithWebSpeech = useCallback(
    (text: string) => {
      if (!settings.fallbackWebSpeech || !isSupported) {
        setError("Audio fallback is not available");
        return;
      }
      stop();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = rateMap[settings.speechRate];
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.voice = voices.find((voice) => voice.lang.startsWith("ja")) ?? null;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setError("Web Speech failed");
        setIsPlaying(false);
      };
      setError(null);
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, settings.fallbackWebSpeech, settings.speechRate, stop, voices],
  );

  const playLocalAudio = useCallback(
    (src: string, fallbackText?: string) => {
      stop();
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setError("Local audio missing");
        setIsPlaying(false);
        if (fallbackText) speakWithWebSpeech(fallbackText);
      };
      setError(null);
      setIsPlaying(true);
      void audio.play().catch(() => {
        setError("Audio playback blocked");
        setIsPlaying(false);
        if (fallbackText) speakWithWebSpeech(fallbackText);
      });
    },
    [speakWithWebSpeech, stop],
  );

  return { playLocalAudio, speakWithWebSpeech, stop, isPlaying, isSupported, hasJapaneseVoice, error };
}
