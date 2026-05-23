import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Browsers can reject storage in private mode; app state still works in memory.
    }
  }, [key, value]);

  const setStoredValue = useCallback((next: T | ((current: T) => T)) => {
    setValue((current) => (typeof next === "function" ? (next as (current: T) => T)(current) : next));
  }, []);

  return [value, setStoredValue] as const;
}
