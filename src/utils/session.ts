import { shuffle } from "./shuffle";

export function pickRandomItems<T>(items: T[], limit: number): T[] {
  return shuffle(items).slice(0, limit);
}

export function shuffleItems<T>(items: T[]): T[] {
  return shuffle(items);
}
