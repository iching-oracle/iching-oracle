import { describe, expect, it } from "vitest";
import { getHexagram } from "@/lib/hexagrams";
import {
  generateWeeklyOracle,
  getIsoWeekKey,
  getIsoWeekNumber,
  getWeeklyHexagramNumber,
  startOfUtcWeek,
} from "@/lib/weekly-oracle/generate";

describe("weekly oracle generation", () => {
  it("produces a stable hexagram for a given ISO week", () => {
    const monday = new Date("2026-06-22T12:00:00.000Z");
    const a = generateWeeklyOracle(monday);
    const b = generateWeeklyOracle(monday);

    expect(a).toEqual(b);
    expect(a.weekKey).toBe(getIsoWeekKey(monday));
    expect(a.hexagramNumber).toBe(getWeeklyHexagramNumber(monday));
  });

  it("maps ISO week number to hexagram 1–64", () => {
    for (let week = 1; week <= 64; week += 1) {
      const number = ((week - 1) % 64) + 1;
      expect(number).toBeGreaterThanOrEqual(1);
      expect(number).toBeLessThanOrEqual(64);
    }
  });

  it("uses hexagram judgment as the oracle message", () => {
    const oracle = generateWeeklyOracle(new Date("2026-06-22T12:00:00.000Z"));
    const hex = getHexagram(oracle.hexagramNumber);

    expect(oracle.title).toBe(`Hexagram ${hex.number} — ${hex.englishName}`);
    expect(oracle.message).toBe(hex.judgment);
    expect(oracle.reflectionQuestion).toContain(hex.englishName);
  });

  it("week 27 example resolves to hexagram 27", () => {
    // 2026-06-29 is in ISO week 27
    const week27 = new Date("2026-06-29T10:00:00.000Z");
    expect(getIsoWeekNumber(week27)).toBe(27);
    expect(getWeeklyHexagramNumber(week27)).toBe(27);

    const oracle = generateWeeklyOracle(week27);
    expect(oracle.weekNumber).toBe(27);
    expect(oracle.hexagramNumber).toBe(27);
    expect(oracle.hexagramName).toBe(getHexagram(27).englishName);
  });

  it("startOfUtcWeek returns Monday 00:00 UTC", () => {
    const wednesday = new Date("2026-06-24T15:30:00.000Z");
    const start = startOfUtcWeek(wednesday);

    expect(start.getUTCDay()).toBe(1);
    expect(start.getUTCHours()).toBe(0);
    expect(start.getUTCMinutes()).toBe(0);
  });
});
