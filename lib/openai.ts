import "server-only";

import { formatChangingLines } from "@/lib/iching";
import OpenAI from "openai";

export type InterpretationHexagram = {
  number: number;
  title: string;
  judgment: string;
};

export type InterpretationInput = {
  question: string;
  primaryHexagram: InterpretationHexagram;
  transformedHexagram?: InterpretationHexagram | null;
  changingLines?: number[];
};

/** Legacy placeholder text from early readings — not generated anymore. */
export function isLegacyPlaceholderInterpretation(text: string): boolean {
  return /^This is a temporary interpretation for hexagram \d+\./i.test(
    text.trim(),
  );
}

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  return new OpenAI({ apiKey });
}

function buildPrompt(input: InterpretationInput): string {
  const changingText = formatChangingLines(input.changingLines ?? []);
  const hasTransformed = Boolean(input.transformedHexagram);

  const transformedSection = hasTransformed
    ? `
變卦（未來趨勢）：
第 ${input.transformedHexagram!.number} 卦 ${input.transformedHexagram!.title}
卦辭：${input.transformedHexagram!.judgment}
`
    : `
變卦：無（此卦無動爻，局勢相對穩定）
`;

  return `
你是一位深諳《易經》的智慧占卜師。

使用者問題：
${input.question}

本卦（當下形勢）：
第 ${input.primaryHexagram.number} 卦 ${input.primaryHexagram.title}
卦辭：${input.primaryHexagram.judgment}

動爻：
${changingText}
${transformedSection}

請以繁體中文撰寫 4 至 6 段深入解讀，內容必須包括：
1. 本卦的核心意義，以及與使用者問題的關聯
2. 動爻的象徵意義——什麼正在轉變、為何此刻浮現
3. ${hasTransformed ? "變卦所揭示的未來方向與可能結果" : "在無動爻的情況下，當前局勢的穩定與深耕之道"}
4. 實際可採取的建議與心靈層面的啟發

語氣要溫暖、睿智、具有洞察力。
不要使用英文。
`;
}

function buildFallbackInterpretation(input: InterpretationInput): string {
  const changingText = formatChangingLines(input.changingLines ?? []);
  const transformed = input.transformedHexagram;

  let text = `關於您的問題：「${input.question}」

本卦：第 ${input.primaryHexagram.number} 卦 ${input.primaryHexagram.title}
${input.primaryHexagram.judgment}

動爻：${changingText}`;

  if (transformed) {
    text += `

變卦：第 ${transformed.number} 卦 ${transformed.title}
${transformed.judgment}`;
  }

  text += `

請靜心體會此卦之象，以誠心照見當下之路。心誠則靈，願您在天地之道中找到安身立命的方向。`;

  return text;
}

export async function generateInterpretation(
  input: InterpretationInput,
): Promise<string> {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const openai = getClient();
  const prompt = buildPrompt(input);

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const text = response.output_text?.trim();
    if (!text) {
      throw new Error("OpenAI returned an empty interpretation.");
    }

    return text;
  } catch (error) {
    console.error("[openai] generateInterpretation failed", error);
    return buildFallbackInterpretation(input);
  }
}
