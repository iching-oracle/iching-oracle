import "server-only";

import { getHexagram } from "@/lib/hexagrams";
import {
  buildDailyOracleUserPrompt,
  getDailyOracleSystemPrompt,
} from "@/lib/daily-oracle/prompts";
import type { DailyOracleAIContent } from "@/types/daily-oracle";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

function clampEnergy(level: number): number {
  return Math.min(100, Math.max(0, Math.round(level)));
}

function parseAIJson(raw: string): DailyOracleAIContent | null {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as DailyOracleAIContent;
    if (!parsed.oracleMessage || !parsed.reflectionQuote) return null;
    return {
      ...parsed,
      energyLevel: clampEnergy(Number(parsed.energyLevel) || 50),
      energyTheme: parsed.energyTheme || "balanced",
    };
  } catch {
    return null;
  }
}

function fallbackContent(
  hexagramNumber: number,
  language: string,
): DailyOracleAIContent {
  const hex = getHexagram(hexagramNumber);
  const isDe = language === "de";
  const isZh = language === "zh-CN";

  if (isDe) {
    return {
      oracleMessage: `Heute trägt das ${hex.title} (${hex.chineseName}) die Energie des Tages. ${hex.judgment}`,
      emotionalInsight:
        "Innere Bewegung sucht Form — beobachte, was sich heute ohne Urteil zeigt.",
      recommendedAction:
        "Handle mit Beständigkeit: eine kleine, ehrliche Tat genügt, um den Tag zu erden.",
      caution: "Vermeide es, aus Ungeduld alte Muster zu beschleunigen.",
      reflectionQuote: "Was sich heute zeigt, kommt nicht, um dich zu prüfen — sondern um dich zu klären.",
      luckyFocus: "Stille Aufmerksamkeit",
      energyLevel: 55 + (hexagramNumber % 30),
      energyTheme: "contemplative",
    };
  }

  if (isZh) {
    return {
      oracleMessage: `今日之卦为「${hex.chineseName}」——${hex.title}。${hex.judgment}`,
      emotionalInsight: "心绪在细微处流动，宜以温柔的目光观照自己。",
      recommendedAction: "做一件小而真实的事，让行动与内心同向。",
      caution: "勿因急躁而重复旧习，今日宜缓不宜迫。",
      reflectionQuote: "今日所显，不为考验，只为照亮你正在走的路。",
      luckyFocus: "静心观照",
      energyLevel: 55 + (hexagramNumber % 30),
      energyTheme: "balanced",
    };
  }

  return {
    oracleMessage: `Today's hexagram is ${hex.title} (${hex.chineseName}). ${hex.judgment}`,
    emotionalInsight:
      "Something in you is adjusting its shape — notice what arises without forcing meaning too soon.",
    recommendedAction:
      "Choose one honest, modest action that aligns with patience rather than urgency.",
    caution: "Do not mistake haste for clarity; let the day unfold at its own pace.",
    reflectionQuote:
      "What appears today is not here to test you — it is here to refine your attention.",
    luckyFocus: "Quiet presence",
    energyLevel: 55 + (hexagramNumber % 30),
    energyTheme: "balanced",
  };
}

export async function generateDailyOracleContent(
  hexagramNumber: number,
  dateKey: string,
  language: string,
): Promise<DailyOracleAIContent> {
  const hexagram = getHexagram(hexagramNumber);
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();

  if (!apiKey) {
    return fallbackContent(hexagramNumber, language);
  }

  const model = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.75,
        max_tokens: 1200,
        messages: [
          { role: "system", content: getDailyOracleSystemPrompt() },
          {
            role: "user",
            content: buildDailyOracleUserPrompt(hexagram, dateKey, language),
          },
        ],
      }),
    });

    if (!response.ok) {
      return fallbackContent(hexagramNumber, language);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return fallbackContent(hexagramNumber, language);

    const parsed = parseAIJson(content);
    return parsed ?? fallbackContent(hexagramNumber, language);
  } catch (error) {
    console.error("[daily-oracle] AI generation failed", error);
    return fallbackContent(hexagramNumber, language);
  }
}
