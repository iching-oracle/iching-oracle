import type { InsightReportType, ReadingInsightAnalytics } from "@/types/insights";

/** Shared safety rails for all insight AI outputs. */
export const INSIGHT_ETHICS_BLOCK = `ETHICAL CONSTRAINTS (mandatory):
- Never claim certainty about the future, fate, or another person's intentions.
- No medical, psychiatric, or legal advice; no diagnosis of mental illness.
- Avoid dependency language ("you need this app", "only the oracle knows", "don't trust yourself").
- Frame observations as invitations to reflect, not commands or verdicts.
- Acknowledge AI limits: patterns are inferred from text statistics, not inner truth.
- Use probabilistic, gentle phrasing ("may suggest", "could invite", "worth noticing").`;

export function buildPatternInsightSystemPrompt(premium: boolean): string {
  const shape = premium
    ? `{"summary":"...","themes":["..."],"patterns":["..."],"reflections":["..."],"emotionalGuidance":["..."],"growthSummary":"one paragraph","oracleTrendAnalysis":"one paragraph"}`
    : `{"summary":"one rich paragraph (4-7 sentences)","themes":["...","..."],"patterns":["...","..."],"reflections":["...","..."]}`;

  return `You are a contemplative spiritual companion reflecting on a seeker's I Ching reading history.

OUTPUT: Valid JSON only (no markdown), shape:
${shape}

TONE: Wise, calm, modern, emotionally intelligent — not theatrical or fortune-cookie.

${INSIGHT_ETHICS_BLOCK}

FIELD RULES:
- themes: 3-5 short phrases; patterns: 4-6 observations; reflections: 3-5 gentle contemplations (not commands).
- Match the user's language code: de = German, zh-CN = Simplified Chinese, en = English.
${
  premium
    ? `- emotionalGuidance: 3-4 short supportive reframes (not therapy).
- growthSummary: one paragraph on spiritual/personal evolution signals (non-deterministic).
- oracleTrendAnalysis: hexagram recurrence & consultation rhythm, as metaphor not prediction.`
    : ""
}`;
}

export function buildPatternInsightUserPrompt(
  analytics: ReadingInsightAnalytics,
  compactHistory: string,
  language: string,
): string {
  const lang =
    language === "de" ? "de" : language === "zh-CN" ? "zh-CN" : "en";

  const toneLine = analytics.emotionalToneByMonth
    .map(
      (m) =>
        `${m.monthLabel}: calm${m.calm}/seek${m.seeking}/turb${m.turbulent}/hope${m.hopeful}`,
    )
    .join(" | ");

  const trendsLine = analytics.behavioralTrends
    .map((t) => `${t.label}(${t.direction}): ${t.detail}`)
    .join(" · ");

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
- Emotional tone by month: ${toneLine || "n/a"}
- Behavioral trends: ${trendsLine || "n/a"}
- Spiritual growth depth: ${analytics.spiritualGrowth.reflectionDepth}; consistency ${analytics.spiritualGrowth.journalConsistency}; shift: ${analytics.spiritualGrowth.categoryShiftNote ?? "none"}
- Resonance feedback: ${
    analytics.resonance
      ? `deeply ${analytics.resonance.deeply}, somewhat ${analytics.resonance.somewhat}, not_really ${analytics.resonance.notReally}`
      : "n/a"
  }
- Monthly volume (oldest→newest): ${analytics.monthlyVolume.map((m) => `${m.label}:${m.count}`).join(" | ")}
- Dominant category by recent months: ${analytics.dominantCategoryByMonth
    .map((r) => `${r.monthLabel}→${r.category}`)
    .join(" | ")}

RECENT QUESTION SNIPPETS (length-capped; do not quote verbatim at length):
${compactHistory}`;
}

export function buildPeriodReportSystemPrompt(
  reportType: InsightReportType,
): string {
  const horizon =
    reportType === "weekly"
      ? "the past 7 days of consultation rhythm"
      : "the past calendar month of reflection";

  return `You write a ${reportType} spiritual reflection digest for an I Ching journal user.

OUTPUT: Valid JSON only:
{"periodLabel":"...","headline":"short poetic title","body":"2-4 calm paragraphs","highlights":["..."],"gentlePrompts":["..."]}

Scope: ${horizon}.

${INSIGHT_ETHICS_BLOCK}

- highlights: 3-5 bullet observations; gentlePrompts: 2-4 journaling invitations.
- Match user language code in all strings.`;
}

export function buildPeriodReportUserPrompt(
  reportType: InsightReportType,
  analytics: ReadingInsightAnalytics,
  compactHistory: string,
  language: string,
  periodLabel: string,
): string {
  const lang =
    language === "de" ? "de" : language === "zh-CN" ? "zh-CN" : "en";

  return `Language: ${lang}
Period label to use: ${periodLabel}
Report type: ${reportType}

Analytics snapshot:
${buildPatternInsightUserPrompt(analytics, compactHistory, language)}`;
}
