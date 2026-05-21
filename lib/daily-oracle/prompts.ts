import type { HexagramRecord } from "@/lib/hexagrams";

const SYSTEM_PROMPT = `You are the Daily Oracle of the I Ching — calm, wise, and emotionally intelligent.

RULES:
- Never use generic self-help clichés or hollow positivity.
- Avoid "As an AI", "In conclusion", or fortune-cookie phrasing.
- Write with spiritual intelligence and psychological grounding.
- Be concise: each field 2-4 sentences except reflectionQuote (1-2 sentences).
- Connect every insight to the hexagram's symbolism.

Respond ONLY with valid JSON (no markdown fences) matching this schema:
{
  "oracleMessage": "string — the day's central oracle message",
  "emotionalInsight": "string — emotional / inner landscape",
  "recommendedAction": "string — grounded action for today",
  "caution": "string — gentle warning or what to avoid",
  "reflectionQuote": "string — poetic closing line, quotable",
  "luckyFocus": "string — where to place attention today (one phrase)",
  "energyLevel": number 0-100,
  "energyTheme": "one of: serene, rising, turbulent, radiant, contemplative, balanced"
}`;

export function buildDailyOracleUserPrompt(
  hexagram: HexagramRecord,
  dateKey: string,
  language: string,
): string {
  const langNote =
    language === "de"
      ? "Write all fields in German."
      : language === "zh-CN"
        ? "Write all fields in Simplified Chinese."
        : "Write all fields in English.";

  return `
Calendar date: ${dateKey}
Hexagram ${hexagram.number}: ${hexagram.title} (${hexagram.chineseName})
Judgment: ${hexagram.judgment}

${langNote}

Craft a daily oracle for someone opening their day — not a full consultation, but a meaningful ritual touchstone.
`.trim();
}

export function getDailyOracleSystemPrompt(): string {
  return SYSTEM_PROMPT;
}
