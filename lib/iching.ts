import {
  findHexagramNumber,
  lineValuesToBooleans,
} from "@/lib/hexagram-lines";

export type LineValue = 6 | 7 | 8 | 9;

/** Three-coin method: each line is 6, 7, 8, or 9. Index 0 = bottom line. */
export function castLines(): number[] {
  const lines: number[] = [];
  for (let i = 0; i < 6; i++) {
    let sum = 0;
    for (let j = 0; j < 3; j++) {
      sum += Math.random() < 0.5 ? 2 : 3;
    }
    lines.push(sum);
  }
  return lines;
}

export function getPrimaryHexagram(lineValues: number[]): number {
  return findHexagramNumber(lineValuesToBooleans(lineValues));
}

/** Changing line positions 1–6 (bottom to top). */
export function getChangingLines(lineValues: number[]): number[] {
  return lineValues
    .map((value, index) => (value === 6 || value === 9 ? index + 1 : null))
    .filter((position): position is number => position !== null);
}

/** Transformed lines after 6→yang, 9→yin. */
export function getTransformedLines(lineValues: number[]): boolean[] {
  return lineValues.map((value) => {
    if (value === 6) return true;
    if (value === 9) return false;
    return value === 7;
  });
}

export function getTransformedHexagram(lineValues: number[]): number | null {
  if (getChangingLines(lineValues).length === 0) return null;
  return findHexagramNumber(getTransformedLines(lineValues));
}

/** e.g. [3] → "第 3 爻", [3, 5] → "第 3 爻、第 5 爻", [] → "無動爻" */
export function formatChangingLines(lines: number[]): string {
  if (lines.length === 0) return "無動爻";
  return lines.map((n) => `第 ${n} 爻`).join("、");
}

/** Compact badge for dashboard, e.g. "3→5". */
export function formatChangingLinesBadge(lines: number[]): string {
  if (lines.length === 0) return "";
  return lines.join("→");
}

export function serializeChangingLines(lines: number[]): string | null {
  return lines.length > 0 ? lines.join(",") : null;
}

export function parseChangingLines(stored: string | null | undefined): number[] {
  if (!stored?.trim()) return [];
  return stored
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 6);
}

export function serializeLineValues(lineValues: number[]): string {
  return JSON.stringify(lineValues);
}

export function parseLineValues(stored: string | null | undefined): number[] {
  if (!stored?.trim()) return [];
  try {
    const parsed = JSON.parse(stored) as unknown;
    if (
      Array.isArray(parsed) &&
      parsed.length === 6 &&
      parsed.every((v) => v === 6 || v === 7 || v === 8 || v === 9)
    ) {
      return parsed as number[];
    }
  } catch {
    // legacy rows
  }
  return [];
}
