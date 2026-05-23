export function toDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(days: number, from = new Date()): string {
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return toDateKey(next);
}

export function isDue(dateKey: string | null): boolean {
  if (!dateKey) return true;
  return dateKey <= toDateKey();
}

export function daysBetween(a: string, b: string): number {
  const start = new Date(`${a}T00:00:00`);
  const end = new Date(`${b}T00:00:00`);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}
