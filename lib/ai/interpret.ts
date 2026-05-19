import {
  castThreeCoins,
  getRelatingHexagram,
  type CastResult,
} from "@/lib/iching/cast";
import { getHexagram } from "@/lib/iching/hexagrams";

export type InterpretationInput = {
  question: string;
  cast: CastResult;
};

export type InterpretationResult = {
  interpretation: string;
  cast: CastResult;
  relatingHexagram: number | null;
};

function buildFallbackInterpretation(input: InterpretationInput): string {
  const primary = getHexagram(input.cast.hexagram);
  const relatingNum = getRelatingHexagram(
    input.cast.lines,
    input.cast.changingLines,
  );
  const relating = relatingNum ? getHexagram(relatingNum) : null;

  const changingText =
    input.cast.changingLines.length > 0
      ? `Changing lines (from bottom): ${input.cast.changingLines.join(", ")}.`
      : "No changing lines — the situation is relatively stable.";

  const relatingText = relating
    ? `\n\nThe relating hexagram is ${relating.number} · ${relating.nameZh} (${relating.nameEn}): ${relating.summary}`
    : "";

  return `Regarding your question —「${input.question}」

The oracle presents Hexagram ${primary.number} · ${primary.nameZh} (${primary.nameEn}).

${primary.summary}

${changingText}${relatingText}

心誠則靈 — sit with this image. The I Ching speaks in symbols; let your sincerity draw out the meaning that fits your path.`;
}

async function buildAiInterpretation(
  input: InterpretationInput,
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const primary = getHexagram(input.cast.hexagram);
  const relatingNum = getRelatingHexagram(
    input.cast.lines,
    input.cast.changingLines,
  );
  const relating = relatingNum ? getHexagram(relatingNum) : null;

  const systemPrompt = `You are a wise, compassionate I Ching oracle interpreter. 
Write in a calm, poetic yet clear tone. Use both English and occasional Classical Chinese phrases.
Reference the hexagram symbolism without being overly dogmatic. Keep the reading to 3–5 short paragraphs.`;

  const userPrompt = `Question: ${input.question}

Primary hexagram: ${primary.number} ${primary.nameZh} (${primary.nameEn}) — ${primary.summary}
Changing lines: ${input.cast.changing ?? "none"}
${relating ? `Relating hexagram: ${relating.number} ${relating.nameZh} (${relating.nameEn}) — ${relating.summary}` : ""}

Provide a personalized interpretation for the seeker.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      console.error("[interpret] OpenAI error", await response.text());
      return null;
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (error) {
    console.error("[interpret] OpenAI request failed", error);
    return null;
  }
}

export async function createReadingInterpretation(
  question: string,
): Promise<InterpretationResult> {
  const cast = castThreeCoins();
  const input: InterpretationInput = { question, cast };

  const aiText = await buildAiInterpretation(input);
  const interpretation = aiText ?? buildFallbackInterpretation(input);
  const relatingHexagram = getRelatingHexagram(
    cast.lines,
    cast.changingLines,
  );

  return { interpretation, cast, relatingHexagram };
}
