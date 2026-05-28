import type { AnalyticsProperties } from "@/lib/analytics/properties";

/** Keys that must never be stored or forwarded to third parties. */
const BLOCKED_KEYS = new Set([
  "question",
  "question_text",
  "email",
  "name",
  "password",
  "interpretation",
  "content",
  "message",
  "notes",
]);

/**
 * Strip sensitive fields and normalize property values for storage.
 */
export function sanitizeAnalyticsProperties(
  properties?: AnalyticsProperties | Record<string, unknown>,
): AnalyticsProperties {
  if (!properties) return {};

  const safe: AnalyticsProperties = {};

  for (const [key, value] of Object.entries(properties)) {
    const lower = key.toLowerCase();
    if (BLOCKED_KEYS.has(lower)) continue;
    if (lower.includes("question") && lower !== "question_length") continue;
    if (lower.includes("email") || lower.includes("password")) continue;

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      safe[key] = value;
    }
  }

  return safe;
}

/** Derive question length without storing the question. */
export function questionLength(question: string): number {
  return question.trim().length;
}

/** Reading metadata safe for analytics. */
export function readingAnalyticsMeta(input: {
  category?: string;
  question: string;
  interpretation?: string;
  changingLinesCount?: number;
  responseTimeMs?: number;
  hexagram?: number;
  readingId?: string;
  isPremium?: boolean;
}): AnalyticsProperties {
  return sanitizeAnalyticsProperties({
    category: input.category,
    question_length: questionLength(input.question),
    reading_length: input.interpretation?.length,
    changing_lines_count: input.changingLinesCount,
    response_time_ms: input.responseTimeMs,
    hexagram: input.hexagram,
    reading_id: input.readingId,
    is_premium: input.isPremium,
  });
}
