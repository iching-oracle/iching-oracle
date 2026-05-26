import "server-only";

import { buildOracleChatContextFromReading } from "@/lib/chat/context";
import { buildOracleContextFromReading } from "@/lib/interpretation/context";
import { teeStreamForPersistence } from "@/lib/chat/stream";
import { truncateChatHistory, type ChatTurn } from "@/lib/chat/truncate";
import {
  buildConversationalOraclePrompt,
  buildPostReadingOraclePrompt,
} from "@/lib/oracle-chat/prompts";
import { buildConversationSummary } from "@/lib/oracle-chat/summary";
import { shouldSuggestOracleCast } from "@/lib/oracle-chat/suggest-cast";
import type { OracleMessage, Reading } from "@prisma/client";

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

function toChatTurns(
  messages: Pick<OracleMessage, "role" | "content">[],
): ChatTurn[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
}

async function streamDeepSeekChat(
  systemPrompt: string,
  history: ChatTurn[],
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = getDeepSeekApiKey();
  const model = getDeepSeekModel();
  const trimmedHistory = truncateChatHistory(history);

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> =
    [
      { role: "system", content: systemPrompt },
      ...trimmedHistory.map((m) => ({
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
      temperature: 0.78,
      max_tokens: 1400,
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Oracle chat stream failed (${response.status}): ${errorBody || response.statusText}`,
    );
  }

  if (!response.body) {
    throw new Error("Oracle chat stream returned no body.");
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

export async function streamOracleConversationChat(params: {
  userId: string;
  language: string;
  messages: OracleMessage[];
  reading: Reading | null;
  newUserMessage: string;
  memoryBlock?: string;
}): Promise<ReadableStream<Uint8Array>> {
  const history = [
    ...toChatTurns(params.messages),
    { role: "user" as const, content: params.newUserMessage },
  ];

  const summary = buildConversationSummary(params.messages);
  const userCount = params.messages.filter((m) => m.role === "user").length + 1;

  if (params.reading) {
    const chatCtx = buildOracleChatContextFromReading(params.reading);
    const oracleCtx = buildOracleContextFromReading(
      params.reading,
      params.reading.interpretationMode,
    );
    const systemPrompt = buildPostReadingOraclePrompt({
      language: params.language,
      context: oracleCtx,
      interpretationExcerpt: chatCtx.interpretationExcerpt,
      conversationSummary: summary,
      memoryBlock: params.memoryBlock,
    });
    return streamDeepSeekChat(systemPrompt, history);
  }

  const suggestCast = shouldSuggestOracleCast({
    userMessageCount: userCount,
    hasReading: false,
    lastUserMessage: params.newUserMessage,
  });

  const systemPrompt = buildConversationalOraclePrompt({
    language: params.language,
    suggestCast,
    conversationSummary: summary,
    memoryBlock: params.memoryBlock,
  });

  return streamDeepSeekChat(systemPrompt, history);
}

export { teeStreamForPersistence };
