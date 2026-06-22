import { describe, expect, it } from "vitest";
import { generateWeeklyOracle } from "@/lib/weekly-oracle/generate";
import {
  renderWeeklyOracleEmailBody,
  renderWeeklyOracleEmailText,
} from "@/lib/email/templates/weekly-oracle";

describe("weekly oracle email template", () => {
  const oracle = generateWeeklyOracle(new Date("2026-06-22T12:00:00.000Z"));

  it("renders hexagram title and reflection in HTML body", () => {
    const html = renderWeeklyOracleEmailBody(oracle, "Seeker");

    expect(html).toContain("Seeker");
    expect(html).toContain(oracle.title);
    expect(html).toContain(oracle.message);
    expect(html).toContain("Reflection");
    expect(html).toContain(oracle.reflectionQuestion);
    expect(html).toContain(`Week ${oracle.weekNumber}`);
  });

  it("renders plain-text fallback with CTA URL", () => {
    const text = renderWeeklyOracleEmailText(
      oracle,
      "Seeker",
      "https://example.com/hexagrams/11",
    );

    expect(text).toContain(oracle.title);
    expect(text).toContain(oracle.message);
    expect(text).toContain(oracle.reflectionQuestion);
    expect(text).toContain("https://example.com/hexagrams/11");
  });
});
