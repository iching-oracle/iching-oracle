import "server-only";

import OpenAI from "openai";

type Hexagram = {
  number: number;
  title: string;
  judgment: string;
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

export async function generateInterpretation(
  question: string,
  hexagram: Hexagram,
): Promise<string> {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const openai = getClient();

  const prompt = `
你是一位深諳《易經》的智慧占卜師。

使用者問題：
${question}

卦象：
第 ${hexagram.number} 卦 ${hexagram.title}

卦辭：
${hexagram.judgment}

請以繁體中文撰寫 3 至 5 段深入解讀，內容應包括：
1. 此卦的核心意義
2. 與使用者問題的關聯
3. 實際可採取的建議
4. 心靈層面的啟發

語氣要溫暖、睿智、具有洞察力。
不要使用英文。
`;

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  const text = response.output_text?.trim();
  if (!text) {
    throw new Error("OpenAI returned an empty interpretation.");
  }

  return text;
}
