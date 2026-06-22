import { getHexagram } from "@/lib/hexagrams";

export type WeeklyOracleContent = {
  weekKey: string;
  weekNumber: number;
  hexagramNumber: number;
  title: string;
  hexagramName: string;
  message: string;
  reflectionQuestion: string;
};

/** ISO week key, e.g. `2026-W27`. */
export function getIsoWeekKey(date = new Date()): string {
  const utc = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(
    ((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return `${utc.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

export function getIsoWeekNumber(date = new Date()): number {
  const match = getIsoWeekKey(date).match(/-W(\d+)$/);
  return match ? Number.parseInt(match[1], 10) : 1;
}

/** Deterministic hexagram for the ISO week — same for all users. */
export function getWeeklyHexagramNumber(date = new Date()): number {
  const weekNumber = getIsoWeekNumber(date);
  return ((weekNumber - 1) % 64) + 1;
}

function buildReflectionQuestion(englishName: string): string {
  return `How might the spirit of ${englishName} guide your choices this week?`;
}

/** Build the shared weekly oracle content (no AI, no per-user variation). */
export function generateWeeklyOracle(date = new Date()): WeeklyOracleContent {
  const weekKey = getIsoWeekKey(date);
  const weekNumber = getIsoWeekNumber(date);
  const hexagramNumber = getWeeklyHexagramNumber(date);
  const hex = getHexagram(hexagramNumber);

  return {
    weekKey,
    weekNumber,
    hexagramNumber,
    title: `Hexagram ${hexagramNumber} — ${hex.englishName}`,
    hexagramName: hex.englishName,
    message: hex.judgment,
    reflectionQuestion: buildReflectionQuestion(hex.englishName),
  };
}

export function startOfUtcWeek(date = new Date()): Date {
  const utc = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = utc.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  utc.setUTCDate(utc.getUTCDate() - diff);
  return utc;
}
