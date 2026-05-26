import "server-only";

import type { OracleMessage } from "@prisma/client";

export function distillQuestionFromMessages(
  messages: Pick<OracleMessage, "role" | "content">[],
): string {
  const userMsgs = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.trim())
    .filter(Boolean);

  if (userMsgs.length === 0) {
    return "An open reflection with the oracle";
  }

  const first = userMsgs[0]!;
  if (first.length >= 24) {
    return first.slice(0, 500);
  }

  return userMsgs.join(" · ").slice(0, 500);
}

export function buildConversationSummary(
  messages: Pick<OracleMessage, "role" | "content">[],
): string {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-10)
    .map((m) => `${m.role === "user" ? "Seeker" : "Guide"}: ${m.content}`)
    .join("\n\n")
    .slice(0, 4000);
}
