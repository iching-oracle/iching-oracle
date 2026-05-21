import "server-only";

import { truncateChatHistory, type ChatTurn } from "@/lib/chat/truncate";
import { buildFollowUpSystemPrompt } from "@/lib/chat/prompts";
import type { OracleChatContext } from "@/types/chat";

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

/**
 * OpenAI-compatible streaming (same transport as Vercel AI SDK streamText).
 * Uses DeepSeek per project configuration.
 */
export async function streamFollowUpChat(params: {
  context: OracleChatContext;
  history: ChatTurn[];
}): Promise<ReadableStream<Uint8Array>> {
  const apiKey = getDeepSeekApiKey();
  const model = getDeepSeekModel();
  const history = truncateChatHistory(params.history);

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> =
    [
      { role: "system", content: buildFollowUpSystemPrompt(params.context) },
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: true,
      temperature: 0.75,
      max_tokens: 1200,
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Chat stream failed (${response.status}): ${errorBody || response.statusText}`,
    );
  }

  if (!response.body) {
    throw new Error("Chat stream returned no body.");
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

/** Wrap stream to accumulate full assistant text for persistence. */
export function teeStreamForPersistence(
  source: ReadableStream<Uint8Array>,
  onComplete: (fullText: string) => Promise<void>,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  let fullText = "";

  return new ReadableStream({
    async start(controller) {
      const reader = source.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          controller.enqueue(value);
        }
        controller.close();
        if (fullText.trim()) {
          await onComplete(fullText.trim());
        }
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });
}
