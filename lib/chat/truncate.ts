import type { ChatMessageRole } from "@/types/chat";

export type ChatTurn = {
  role: ChatMessageRole;
  content: string;
};

const MAX_TURNS = 12;
const MAX_CHARS_PER_MESSAGE = 1200;
const MAX_TOTAL_CHARS = 8000;

export function truncateChatHistory(messages: ChatTurn[]): ChatTurn[] {
  const recent = messages.slice(-MAX_TURNS).map((m) => ({
    role: m.role,
    content:
      m.content.length > MAX_CHARS_PER_MESSAGE
        ? `${m.content.slice(0, MAX_CHARS_PER_MESSAGE)}…`
        : m.content,
  }));

  let total = recent.reduce((sum, m) => sum + m.content.length, 0);
  while (total > MAX_TOTAL_CHARS && recent.length > 2) {
    recent.shift();
    total = recent.reduce((sum, m) => sum + m.content.length, 0);
  }

  return recent;
}
