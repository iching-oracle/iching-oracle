import { binaryToHexagramNumber } from "./hexagrams";

/** Line values from three-coin method: 6, 7, 8, 9 */
export type LineValue = 6 | 7 | 8 | 9;

export type CastResult = {
  lines: LineValue[];
  hexagram: number;
  changing: string | null;
  changingLines: number[];
};

function castLine(): LineValue {
  let sum = 0;
  for (let i = 0; i < 3; i++) {
    sum += Math.random() < 0.5 ? 2 : 3;
  }
  return sum as LineValue;
}

function lineToBit(value: LineValue): "0" | "1" {
  return value === 7 || value === 9 ? "1" : "0";
}

function linesToBinary(lines: LineValue[]): string {
  return lines.map(lineToBit).join("");
}


function flipLine(bit: "0" | "1"): "0" | "1" {
  return bit === "0" ? "1" : "0";
}

/** Three-coin divination: six lines from bottom (index 0) to top (index 5). */
export function castThreeCoins(): CastResult {
  const lines: LineValue[] = [];
  for (let i = 0; i < 6; i++) {
    lines.push(castLine());
  }

  const changingLines = lines
    .map((line, index) => (line === 6 || line === 9 ? index + 1 : null))
    .filter((n): n is number => n !== null);

  const binary = linesToBinary(lines);
  const hexagram = binaryToHexagramNumber(binary);

  return {
    lines,
    hexagram,
    changingLines,
    changing: changingLines.length > 0 ? changingLines.join(",") : null,
  };
}

/** Apply changing lines to derive the relating hexagram. */
export function getRelatingHexagram(
  lines: LineValue[],
  changingLines: number[],
): number | null {
  if (changingLines.length === 0) return null;

  const bits = lines.map(lineToBit);
  for (const lineNum of changingLines) {
    const idx = lineNum - 1;
    bits[idx] = flipLine(bits[idx]);
  }
  return binaryToHexagramNumber(bits.join(""));
}

export function formatLinesDisplay(lines: LineValue[]): string {
  const symbols: Record<LineValue, string> = {
    6: "⚋×",
    7: "⚊",
    8: "⚋",
    9: "⚊×",
  };
  return [...lines].reverse().map((l) => symbols[l]).join(" ");
}
