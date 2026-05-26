import type { ReadingInsightAnalytics } from "@/types/insights";

export function buildPatternInsightSystemPrompt(): string {
  return `You are a contemplative spiritual–psychological guide reflecting on a seeker's I Ching reading history.

OUTPUT: Valid JSON only (no markdown), shape:
{"summary":"one rich paragraph (4-7 sentences)","themes":["...","..."],"patterns":["...","..."],"reflections":["...","..."]}

RULES:
- Wise, calm, modern — not theatrical or fortune-cookie.
- No certain predictions, no fear-mongering, no medical/legal/financial directives.
- Ground every point in the statistical hints provided; you may infer emotional tone, not fate.
- themes: 3-5 short phrases; patterns: 4-6 observations; reflections: 3-5 gentle actionable contemplations (not commands).
- Match the user's language code: de = German, zh-CN = Simplified Chinese, en = English.`;
}

export function buildPatternInsightUserPrompt(
  analytics: ReadingInsightAnalytics,
  compactHistory: string,
  language: string,
): string {
  const lang =
    language === "de" ? "de" : language === "zh-CN" ? "zh-CN" : "en";

  return `Language code for all strings: ${lang}

LOCAL ANALYTICS (trust these counts):
- Total readings: ${analytics.totalReadings}
- Favorites: ${analytics.favoriteCount}
- Last 30 days: ${analytics.readingsThisMonth}
- Top category: ${analytics.topCategory ? `${analytics.topCategory.label} (${analytics.topCategory.count})` : "n/a"}
- Top hexagram: ${analytics.topHexagram ? `#${analytics.topHexagram.number} ${analytics.topHexagram.title} (${analytics.topHexagram.chineseName}), weight ${analytics.topHexagram.count}` : "n/a"}
- Recurring hexagrams (weighted): ${analytics.topHexagrams
    .slice(0, 5)
    .map((h) => `#${h.number}×${h.count}`)
    .join("; ")}
- Question theme signals: ${analytics.questionThemes.join(", ") || "none detected"}
- Monthly volume (oldest→newest): ${analytics.monthlyVolume.map((m) => `${m.label}:${m.count}`).join(" | ")}
- Dominant category by recent months: ${analytics.dominantCategoryByMonth
    .map((r) => `${r.monthLabel}→${r.category}`)
    .join(" | ")}

RECENT QUESTION SNIPPETS (anonymized length-capped; do not quote verbatim at length):
${compactHistory}`;
}
