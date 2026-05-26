import "server-only";

import {
  buildPatternInsightSystemPrompt,
  buildPatternInsightUserPrompt,
} from "@/lib/insights/prompts";
import type { ReadingInsightAnalytics } from "@/types/insights";
import type { PatternInsightAI } from "@/types/insights";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

function fallbackInsight(
  analytics: ReadingInsightAnalytics,
  language: string,
): PatternInsightAI {
  const isDe = language === "de";
  const isZh = language === "zh-CN";

  const topH = analytics.topHexagram;
  const topC = analytics.topCategory;

  if (isDe) {
    return {
      summary: `In Ihrem Journal finden sich ${analytics.totalReadings} Beratungen — ein stiller Bogen der Aufmerksamkeit.${
        topC
          ? ` Schwerpunkte sammeln sich um „${topC.label}“.`
          : ""
      }${
        topH
          ? ` Das Hexagramm ${topH.chineseName} (${topH.title}) kehrt wieder — vielleicht als wiederkehrende Fragestellung, nicht als Schicksal.`
          : ""
      } Die letzten Wochen zeigen ${analytics.readingsThisMonth} Einträge; das Tempo Ihrer Suche spricht für sich.`,
      themes: [
        "Rückkehr zu vertrauten Fragen",
        "Rhythmus der Beratung",
        ...(analytics.questionThemes.slice(0, 2).map((t) => `Thema: ${t}`)),
      ],
      patterns: [
        topC
          ? `Häufige Kategorie: ${topC.label} (${topC.count}×).`
          : "Breites Themenspektrum.",
        topH
          ? `Wiederholung bei Hexagramm ${topH.number}.`
          : "Wechselnde Kernzeichen.",
        analytics.favoriteCount > 0
          ? `${analytics.favoriteCount} Lesungen sind mit Stern markiert — was Ihnen am meisten bedeutet.`
          : "Wenige Favoriten — vielleicht noch im Erkunden.",
      ],
      reflections: [
        "Notieren Sie, welche Fragen sich wöchentlich verschieben — ohne sie sofort lösen zu müssen.",
        "Eine kurze Pause vor der nächsten Konsultation kann Klarheit schaffen.",
        "Vergleichen Sie Gefühl vor und nach dem Orakel — nicht nur die Antwort.",
      ],
    };
  }

  if (isZh) {
    return {
      summary: `你的记录中共有 ${analytics.totalReadings} 次占卜，这是一条安静的关注轨迹。${
        topC ? `主题多集中在「${topC.label}」。` : ""
      }${
        topH
          ? `卦象「${topH.chineseName}」多次出现——更像反复叩问的心绪，而非定数。`
          : ""
      } 近三十日有 ${analytics.readingsThisMonth} 次，节奏本身也值得被看见。`,
      themes: [
        "问题重访",
        "占卜节奏",
        ...analytics.questionThemes.slice(0, 2).map((t) => `线索：${t}`),
      ],
      patterns: [
        topC ? `常见类别：${topC.label}（${topC.count} 次）。` : "主题较为分散。",
        topH ? `卦象 ${topH.number} 反复出现。` : "卦象多变。",
        analytics.favoriteCount > 0
          ? `有 ${analytics.favoriteCount} 条收藏，标记着对你重要的时刻。`
          : "收藏较少，或许仍在探索。",
      ],
      reflections: [
        "留意哪些问题在数周内自然变形——不必立刻给出答案。",
        "在下一次占卜前留一点空白，让感受沉淀。",
        "比较占卜前后的身体感受与情绪，而不只看文字结论。",
      ],
    };
  }

  return {
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
    ],
    reflections: [
      "Notice which questions reshape themselves week to week — without forcing closure.",
      "A short pause before the next cast can clarify more than urgency.",
      "Compare how you feel before and after a reading, not only the interpretation.",
    ],
  };
}

function parseInsightJson(raw: string): PatternInsightAI | null {
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
    };
  } catch {
    return null;
  }
}

function compactHistorySnippet(readings: { question: string }[]): string {
  return readings
    .slice(0, 25)
    .map((r) =>
      r.question.length > 120 ? `${r.question.slice(0, 117)}…` : r.question,
    )
    .join("\n---\n");
}

export async function generatePatternInsight(
  analytics: ReadingInsightAnalytics,
  readingsForSnippet: { question: string }[],
  language: string,
): Promise<PatternInsightAI> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    return fallbackInsight(analytics, language);
  }

  const model = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";
  const compact = compactHistorySnippet(readingsForSnippet);

  try {
    const res = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.65,
        max_tokens: 1400,
        messages: [
          { role: "system", content: buildPatternInsightSystemPrompt() },
          {
            role: "user",
            content: buildPatternInsightUserPrompt(analytics, compact, language),
          },
        ],
      }),
    });

    if (!res.ok) {
      return fallbackInsight(analytics, language);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return fallbackInsight(analytics, language);

    return parseInsightJson(content) ?? fallbackInsight(analytics, language);
  } catch (e) {
    console.error("[insights/generate]", e);
    return fallbackInsight(analytics, language);
  }
}
