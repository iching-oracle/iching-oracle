import "server-only";

import type { OracleReadingContext } from "@/types/interpretation";
import {
  buildAdvancedSystemPrompt,
  buildAdvancedUserPrompt,
} from "@/lib/interpretation/prompts";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

function getDeepSeekApiKey(): string {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured.");
  }
  return apiKey;
}

function getDeepSeekModel(): string {
  return process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";
}

type StreamChunk = {
  choices?: Array<{
    delta?: { content?: string | null };
    finish_reason?: string | null;
  }>;
  error?: { message?: string };
};

/** Stream DeepSeek chat completion tokens (OpenAI-compatible SSE). */
export async function streamAdvancedInterpretation(
  context: OracleReadingContext,
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = getDeepSeekApiKey();
  const model = getDeepSeekModel();

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: true,
      temperature: 0.85,
      max_tokens: 4500,
      messages: [
        { role: "system", content: buildAdvancedSystemPrompt(context) },
        { role: "user", content: buildAdvancedUserPrompt(context) },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `DeepSeek stream failed (${response.status}): ${errorBody || response.statusText}`,
    );
  }

  if (!response.body) {
    throw new Error("DeepSeek stream returned no body.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;

            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload) as StreamChunk;
              if (parsed.error?.message) {
                throw new Error(parsed.error.message);
              }
              const text = parsed.choices?.[0]?.delta?.content;
              if (text) {
                controller.enqueue(new TextEncoder().encode(text));
              }
            } catch (parseError) {
              if (parseError instanceof SyntaxError) continue;
              throw parseError;
            }
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });
}
