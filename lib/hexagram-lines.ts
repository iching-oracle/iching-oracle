/** Bottom-to-top: index 0 = lowest line, index 5 = top line. true = yang, false = yin. */

const KING_WEN_BINARIES: string[] = [
  "111111", // 1 乾
  "000000", // 2 坤
  "100010", // 3
  "010001", // 4
  "111010", // 5
  "010111", // 6
  "010000", // 7
  "000010", // 8
  "111011", // 9
  "110111", // 10
  "111000", // 11
  "000111", // 12
  "101111", // 13
  "111101", // 14
  "001000", // 15
  "000100", // 16
  "100110", // 17
  "011001", // 18
  "110000", // 19
  "000011", // 20
  "100101", // 21
  "101001", // 22
  "000001", // 23
  "100000", // 24
  "100111", // 25
  "111001", // 26
  "100001", // 27
  "011110", // 28
  "010010", // 29 坎
  "101101", // 30 離
  "001110", // 31 咸
  "011100", // 32
  "001111", // 33
  "111100", // 34
  "000101", // 35
  "101000", // 36
  "110101", // 37
  "010100", // 38
  "001010", // 39
  "100011", // 40
  "110001", // 41
  "011000", // 42
  "010110", // 43
  "011101", // 44
  "111110", // 45
  "000110", // 46
  "010000", // 47
  "110110", // 48
  "011011", // 49
  "101110", // 50
  "011101", // 51
  "100100", // 52
  "001001", // 53
  "110100", // 54
  "001011", // 55
  "111010", // 56
  "011110", // 57
  "110001", // 58
  "110011", // 59
  "001011", // 60
  "110100", // 61
  "101011", // 62
  "001010", // 63 既濟
  "010101", // 64 未濟
];

function binaryToLines(binary: string): boolean[] {
  return binary.split("").map((bit) => bit === "1");
}

/** Deterministic fallback when a number is out of range (not used for 1–64). */
function fallbackLines(hexagramNumber: number): boolean[] {
  const lines: boolean[] = [];
  for (let i = 0; i < 6; i++) {
    lines.push(((hexagramNumber >> i) & 1) === 1);
  }
  return lines;
}

function buildHexagramLinesRecord(): Record<number, boolean[]> {
  const record: Record<number, boolean[]> = {};
  for (let i = 0; i < KING_WEN_BINARIES.length; i++) {
    record[i + 1] = binaryToLines(KING_WEN_BINARIES[i]!);
  }
  return record;
}

export const HEXAGRAM_LINES: Record<number, boolean[]> =
  buildHexagramLinesRecord();

export function getHexagramLines(hexagramNumber: number): boolean[] {
  const lines = HEXAGRAM_LINES[hexagramNumber];
  if (lines) return lines;
  if (hexagramNumber >= 1 && hexagramNumber <= 64) {
    return fallbackLines(hexagramNumber);
  }
  return fallbackLines(((hexagramNumber - 1) % 64) + 1);
}

/** Primary hexagram booleans from cast values (7,9 = yang; 6,8 = yin). */
export function lineValuesToBooleans(lineValues: number[]): boolean[] {
  return lineValues.map((value) => value === 7 || value === 9);
}

function linesEqual(a: boolean[], b: boolean[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

/** Find King Wen hexagram number matching six lines (bottom index 0). */
export function findHexagramNumber(lines: boolean[]): number {
  for (let number = 1; number <= 64; number++) {
    const candidate = HEXAGRAM_LINES[number];
    if (candidate && linesEqual(candidate, lines)) {
      return number;
    }
  }

  const key = lines.map((yang) => (yang ? "1" : "0")).join("");
  for (let number = 1; number <= 64; number++) {
    const candidate = HEXAGRAM_LINES[number];
    if (
      candidate &&
      candidate.map((yang) => (yang ? "1" : "0")).join("") === key
    ) {
      return number;
    }
  }

  return 1;
}
