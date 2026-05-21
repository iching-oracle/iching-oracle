import {
  findHexagramNumber,
  lineValuesToBooleans,
} from "@/lib/hexagram-lines";

/** FNV-1a hash for deterministic daily seeds. */
export function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getTodayDateString(timezoneOffsetMinutes = 0): string {
  const now = new Date();
  const adjusted = new Date(now.getTime() - timezoneOffsetMinutes * 60 * 1000);
  return adjusted.toISOString().slice(0, 10);
}

export function parseDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Deterministic six-line cast from calendar date + identity key. */
export function castDeterministicLines(dateKey: string, identityKey: string): number[] {
  const lines: number[] = [];
  for (let i = 0; i < 6; i++) {
    const seed = hashSeed(`${dateKey}:${identityKey}:line:${i}`);
    const coin1 = seed % 2 === 0 ? 2 : 3;
    const coin2 = (seed >> 8) % 2 === 0 ? 2 : 3;
    const coin3 = (seed >> 16) % 2 === 0 ? 2 : 3;
    lines.push(coin1 + coin2 + coin3);
  }
  return lines;
}

export function getDeterministicHexagram(
  dateKey: string,
  identityKey: string,
): number {
  const lineValues = castDeterministicLines(dateKey, identityKey);
  return findHexagramNumber(lineValuesToBooleans(lineValues));
}

export function serializeLineValues(lineValues: number[]): string {
  return JSON.stringify(lineValues);
}

export function parseLineValues(stored: string): number[] {
  try {
    const parsed = JSON.parse(stored) as unknown;
    if (Array.isArray(parsed) && parsed.length === 6) {
      return parsed as number[];
    }
  } catch {
    /* ignore */
  }
  return castDeterministicLines(getTodayDateString(), "fallback");
}
