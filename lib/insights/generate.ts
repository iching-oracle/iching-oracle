import "server-only";

import { parsePatternInsightJson, parsePeriodReportJson } from "@/lib/insights/ai-json";
import {
  buildPatternInsightSystemPrompt,
  buildPatternInsightUserPrompt,
  buildPeriodReportSystemPrompt,
  buildPeriodReportUserPrompt,
} from "@/lib/insights/prompts";
import { fetchAiCompletion } from "@/lib/monitoring/ai-client";
import type {
  InsightPeriodReport,
  InsightReportType,
  ReadingInsightAnalytics,
} from "@/types/insights";
import type { PatternInsightAI } from "@/types/insights";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

function fallbackInsight(
  analytics: ReadingInsightAnalytics,
  language: string,
  premium: boolean,
): PatternInsightAI {
  const isDe = language === "de";
  const isZh = language === "zh-CN";

  const topH = analytics.topHexagram;
  const topC = analytics.topCategory;

  const baseEn: PatternInsightAI = {
    summary: `Your journal holds ${analytics.totalReadings} consultations — a quiet arc of attention.${
      topC ? ` Themes cluster around ${topC.label}.` : ""
    }${
      topH
        ? ` Hexagram ${topH.chineseName} (${topH.title}) returns — a recurring question, not a verdict.`
        : ""
    } In the last thirty days: ${analytics.readingsThisMonth} readings; the rhythm of seeking is part of the story.`,
    themes: [
      "Returning questions",
      "Cadence of consultation",
      ...analytics.questionThemes.slice(0, 2).map((t) => `Signal: ${t}`),
    ],
    patterns: [
      topC ? `Dominant category: ${topC.label} (${topC.count}).` : "Broad thematic spread.",
      topH ? `Repeated emphasis on hexagram ${topH.number}.` : "Shifting primary hexagrams.",
      analytics.favoriteCount > 0
        ? `${analytics.favoriteCount} starred readings mark what mattered most.`
        : "Few favorites — perhaps still exploring.",
      ...analytics.behavioralTrends.slice(0, 1).map((t) => t.detail),
    ],
    reflections: [
      "Notice which questions reshape themselves week to week — without forcing closure.",
      "A short pause before the next cast can clarify more than urgency.",
      "Compare how you feel before and after a reading, not only the interpretation.",
    ],
  };

  if (isDe) {
    const base: PatternInsightAI = {
      summary: `In Ihrem Journal finden sich ${analytics.totalReadings} Beratungen — ein stiller Bogen der Aufmerksamkeit.${
        topC ? ` Schwerpunkte sammeln sich um „${topC.label}".` : ""
      }${
        topH
          ? ` Das Hexagramm ${topH.chineseName} (${topH.title}) kehrt wieder — vielleicht als wiederkehrende Fragestellung, nicht als Schicksal.`
          : ""
      } Die letzten Wochen zeigen ${analytics.readingsThisMonth} Einträge.`,
      themes: [
        "Rückkehr zu vertrauten Fragen",
        "Rhythmus der Beratung",
        ...analytics.questionThemes.slice(0, 2).map((t) => `Thema: ${t}`),
      ],
      patterns: baseEn.patterns,
      reflections: [
        "Notieren Sie, welche Fragen sich wöchentlich verschieben — ohne sie sofort lösen zu müssen.",
        "Eine kurze Pause vor der nächsten Konsultation kann Klarheit schaffen.",
        "Vergleichen Sie Gefühl vor und nach dem Orakel — nicht nur die Antwort.",
      ],
    };
    if (premium) {
      base.emotionalGuidance = [
        "Was sich wiederholt, verdient Neugier — nicht sofortige Antwort.",
      ];
      base.growthSummary = `Ihre Reflexionstiefe wirkt „${analytics.spiritualGrowth.reflectionDepth}" — ein lebendiger Prozess.`;
      base.oracleTrendAnalysis = topH
        ? `Hexagramm ${topH.number} erscheint häufiger — als Spiegel, nicht als Urteil.`
        : "Wechselnde Kernzeichen deuten auf vielfältige Lebensfragen hin.";
    }
    return base;
  }

  if (isZh) {
    const base: PatternInsightAI = {
      summary: `你的记录中共有 ${analytics.totalReadings} 次占卜。${
        topC ? `主题多集中在「${topC.label}」。` : ""
      }${
        topH ? `卦象「${topH.chineseName}」多次出现——更像反复叩问，而非定数。` : ""
      } 近三十日有 ${analytics.readingsThisMonth} 次。`,
      themes: ["问题重访", "占卜节奏", ...analytics.questionThemes.slice(0, 2)],
      patterns: baseEn.patterns,
      reflections: [
        "留意哪些问题在数周内自然变形——不必立刻给出答案。",
        "在下一次占卜前留一点空白，让感受沉淀。",
        "比较占卜前后的身体感受与情绪，而不只看文字结论。",
      ],
    };
    if (premium) {
      base.emotionalGuidance = ["重复出现的事物，值得以好奇相待，而非急于定论。"];
      base.growthSummary = `你的反思深度处于「${analytics.spiritualGrowth.reflectionDepth}」阶段——仍在展开。`;
      base.oracleTrendAnalysis = topH
        ? `卦象 ${topH.number} 较常出现——作为映照，而非判决。`
        : "卦象多变，显示生命议题的广度。";
    }
    return base;
  }

  if (premium) {
    baseEn.emotionalGuidance = [
      "What repeats deserves curiosity — not an immediate answer.",
      analytics.spiritualGrowth.categoryShiftNote ?? "Notice where your questions soften over time.",
    ].filter(Boolean) as string[];
    baseEn.growthSummary = `Your reflection depth reads as "${analytics.spiritualGrowth.reflectionDepth}" — an unfolding path, not a score.`;
    baseEn.oracleTrendAnalysis = topH
      ? `Hexagram ${topH.number} appears more often — as mirror, not mandate.`
      : "Shifting primary hexagrams suggest diverse life questions in motion.";
  }

  return baseEn;
}

function compactHistorySnippet(readings: { question: string }[]): string {
  return readings
    .slice(0, 25)
    .map((r) =>
      r.question.length > 120 ? `${r.question.slice(0, 117)}…` : r.question,
    )
    .join("\n---\n");
}

async function callInsightModel(
  system: string,
  user: string,
): Promise<string | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";

  try {
    const res = await fetchAiCompletion(
      DEEPSEEK_API_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.65,
          max_tokens: 1800,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      },
      { category: "insights_ai", timeoutMs: 90_000 },
    );

    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    console.error("[insights/generate]", e);
    return null;
  }
}

export async function generatePatternInsight(
  analytics: ReadingInsightAnalytics,
  readingsForSnippet: { question: string }[],
  language: string,
  premium = true,
): Promise<PatternInsightAI> {
  const compact = compactHistorySnippet(readingsForSnippet);
  const content = await callInsightModel(
    buildPatternInsightSystemPrompt(premium),
    buildPatternInsightUserPrompt(analytics, compact, language),
  );

  if (!content) return fallbackInsight(analytics, language, premium);
  return (
    parsePatternInsightJson(content) ??
    fallbackInsight(analytics, language, premium)
  );
}

function fallbackPeriodReport(
  reportType: InsightReportType,
  analytics: ReadingInsightAnalytics,
  periodLabel: string,
  language: string,
): InsightPeriodReport {
  const isDe = language === "de";
  const isZh = language === "zh-CN";

  if (isDe) {
    return {
      periodLabel,
      headline:
        reportType === "weekly" ? "Diese Woche im Spiegel" : "Monatsrückblick",
      body: `In ${periodLabel} hielten Sie ${analytics.readingsThisMonth} Beratungen in den letzten 30 Tagen im Blick. Das Orakel begleitet — es entscheidet nicht.`,
      highlights: analytics.questionThemes.slice(0, 3).map((t) => `Thema: ${t}`),
      gentlePrompts: [
        "Ein Satz: Was hat sich diese Woche leise verschoben?",
      ],
    };
  }

  if (isZh) {
    return {
      periodLabel,
      headline: reportType === "weekly" ? "本周映照" : "月度回顾",
      body: `${periodLabel}，你仍以温柔的节奏与卦象对话。近三十日 ${analytics.readingsThisMonth} 次记录——问题本身即是老师。`,
      highlights: analytics.questionThemes.slice(0, 3),
      gentlePrompts: ["用一句话写下：本周什么感受悄悄改变了？"],
    };
  }

  return {
    periodLabel,
    headline: reportType === "weekly" ? "This week in reflection" : "Monthly mirror",
    body: `Across ${periodLabel}, your journal shows ${analytics.readingsThisMonth} consultations in the last thirty days. The oracle accompanies — it does not decide for you.`,
    highlights: analytics.questionThemes.slice(0, 3),
    gentlePrompts: [
      "Write one sentence: what shifted quietly this week?",
      "Star one reading that still resonates — revisit it without re-casting.",
    ],
  };
}

export async function generatePeriodReport(
  reportType: InsightReportType,
  analytics: ReadingInsightAnalytics,
  readingsForSnippet: { question: string }[],
  language: string,
  periodLabel: string,
): Promise<InsightPeriodReport> {
  const compact = compactHistorySnippet(readingsForSnippet);
  const content = await callInsightModel(
    buildPeriodReportSystemPrompt(reportType),
    buildPeriodReportUserPrompt(
      reportType,
      analytics,
      compact,
      language,
      periodLabel,
    ),
  );

  if (!content) {
    return fallbackPeriodReport(reportType, analytics, periodLabel, language);
  }

  return (
    parsePeriodReportJson(content) ??
    fallbackPeriodReport(reportType, analytics, periodLabel, language)
  );
}
