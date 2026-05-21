import "server-only";

import type { OracleReadingContext } from "@/types/interpretation";
import { parseInterpretationSections } from "@/lib/interpretation/parse";
import {
  buildAdvancedSystemPrompt,
  buildAdvancedUserPrompt,
} from "@/lib/interpretation/prompts";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

async function callDeepSeek(system: string, user: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured.");
  }

  const model = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.85,
      max_tokens: 4500,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`DeepSeek API failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("No interpretation content returned.");
  }

  return content;
}

/** Non-streaming advanced interpretation (used when saving new readings). */
export async function generateAdvancedInterpretation(
  context: OracleReadingContext,
): Promise<{ raw: string; sections: ReturnType<typeof parseInterpretationSections>["sections"] }> {
  const raw = await callDeepSeek(
    buildAdvancedSystemPrompt(context),
    buildAdvancedUserPrompt(context),
  );
  const parsed = parseInterpretationSections(raw, context.mode);
  return { raw: parsed.raw, sections: parsed.sections };
}
