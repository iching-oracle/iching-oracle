import "server-only";

import type { InsightPeriodReport, PatternInsightAI } from "@/types/insights";

export function parsePatternInsightJson(raw: string): PatternInsightAI | null {
  const trimmed = raw.trim();
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const o = JSON.parse(match[0]) as PatternInsightAI;
    if (!o.summary || !Array.isArray(o.themes)) return null;
    return {
      summary: String(o.summary),
      themes: (o.themes ?? []).map(String).slice(0, 8),
      patterns: (o.patterns ?? []).map(String).slice(0, 10),
      reflections: (o.reflections ?? []).map(String).slice(0, 10),
      emotionalGuidance: Array.isArray(o.emotionalGuidance)
        ? o.emotionalGuidance.map(String).slice(0, 6)
        : undefined,
      growthSummary:
        typeof o.growthSummary === "string" ? o.growthSummary : undefined,
      oracleTrendAnalysis:
        typeof o.oracleTrendAnalysis === "string"
          ? o.oracleTrendAnalysis
          : undefined,
    };
  } catch {
    return null;
  }
}

export function parsePeriodReportJson(raw: string): InsightPeriodReport | null {
  const trimmed = raw.trim();
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const o = JSON.parse(match[0]) as InsightPeriodReport;
    if (!o.body || !o.headline) return null;
    return {
      periodLabel: String(o.periodLabel ?? ""),
      headline: String(o.headline),
      body: String(o.body),
      highlights: (o.highlights ?? []).map(String).slice(0, 8),
      gentlePrompts: (o.gentlePrompts ?? []).map(String).slice(0, 6),
    };
  } catch {
    return null;
  }
}
