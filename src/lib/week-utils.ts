export function getCurrentWeekKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const weekNumber = getISOWeekNumber(now);
  return `${year}-W${String(weekNumber).padStart(2, "0")}`;
}

export function getCurrentWeekLabel(): string {
  return weekKeyToLabel(getCurrentWeekKey());
}

export function weekKeyToLabel(weekKey: string): string {
  const [year, week] = weekKey.split("-W");
  return `${year} - Vecka ${parseInt(week)}`;
}

export function labelToWeekKey(label: string): string {
  const match = label.match(/(\d{4})\s*-\s*Vecka\s*(\d+)/);
  if (!match) return "";
  return `${match[1]}-W${String(parseInt(match[2])).padStart(2, "0")}`;
}

export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function makeWeekKey(year: number, weekNumber: number): string {
  return `${year}-W${String(weekNumber).padStart(2, "0")}`;
}

export function parseWeekKey(weekKey: string): { year: number; weekNumber: number } {
  const [year, week] = weekKey.split("-W");
  return { year: parseInt(year), weekNumber: parseInt(week) };
}

export function getRecentWeekKeys(count: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const year = d.getFullYear();
    const week = getISOWeekNumber(d);
    keys.push(makeWeekKey(year, week));
  }
  return keys;
}
