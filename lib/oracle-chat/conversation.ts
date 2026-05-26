import "server-only";

import { getOracleChatLimits } from "@/lib/oracle-chat/limits";
import { shouldSuggestOracleCast } from "@/lib/oracle-chat/suggest-cast";
import { prisma } from "@/lib/prisma";
import type {
  OracleChatMessageDTO,
  OracleChatState,
  OracleReadingMessageMeta,
} from "@/types/oracle-chat";
import type { OracleMessage, Prisma } from "@prisma/client";

function parseReadingMeta(
  metadata: Prisma.JsonValue | null,
): OracleReadingMessageMeta | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const m = metadata as Record<string, unknown>;
  if (typeof m.readingId !== "string") return null;
  return {
    readingId: m.readingId,
    hexagram: Number(m.hexagram) || 0,
    primaryTitle: String(m.primaryTitle ?? ""),
    chineseName: String(m.chineseName ?? ""),
    transformedHexagram:
      m.transformedHexagram != null ? Number(m.transformedHexagram) : null,
    transformedTitle:
      m.transformedTitle != null ? String(m.transformedTitle) : null,
    interpretationExcerpt: String(m.interpretationExcerpt ?? ""),
  };
}

export function toOracleMessageDTO(msg: OracleMessage): OracleChatMessageDTO {
  const role =
    msg.role === "user" ||
    msg.role === "assistant" ||
    msg.role === "oracle_reading" ||
    msg.role === "reflection"
      ? msg.role
      : "assistant";

  return {
    id: msg.id,
    role,
    content: msg.content,
    createdAt: msg.createdAt.toISOString(),
    metadata: parseReadingMeta(msg.metadata),
  };
}

export async function getOracleConversationForUser(
  userId: string,
  conversationId: string,
) {
  return prisma.oracleConversation.findFirst({
    where: { id: conversationId, userId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      reading: true,
    },
  });
}

export async function createOracleConversation(userId: string) {
  return prisma.oracleConversation.create({
    data: { userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function getOrCreateActiveConversation(userId: string) {
  const recent = await prisma.oracleConversation.findFirst({
    where: { userId, status: "active" },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (recent) return recent;

  return createOracleConversation(userId);
}

export async function addOracleMessage(
  conversationId: string,
  role: string,
  content: string,
  metadata?: OracleReadingMessageMeta,
) {
  const [message] = await Promise.all([
    prisma.oracleMessage.create({
      data: {
        conversationId,
        role,
        content,
        metadata: metadata ?? undefined,
      },
    }),
    prisma.oracleConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return message;
}

export async function getEmptyOracleChatState(
  userId: string,
  conversationId: string,
): Promise<OracleChatState> {
  const limits = await getOracleChatLimits(userId, conversationId);
  return {
    conversationId,
    messages: [],
    userMessageCount: 0,
    messageLimit: limits.limit,
    canSend: limits.canSend,
    isPremium: limits.isPremium,
    hasReading: false,
    readingId: null,
    suggestCast: false,
    canCast: true,
  };
}

export async function getOracleChatState(
  userId: string,
  conversationId: string,
) {
  const conversation = await getOracleConversationForUser(
    userId,
    conversationId,
  );
  if (!conversation) return null;

  const limits = await getOracleChatLimits(userId, conversation.id);
  const userMessages = conversation.messages.filter((m) => m.role === "user");
  const lastUser = userMessages[userMessages.length - 1]?.content;

  const suggestCast = shouldSuggestOracleCast({
    userMessageCount: limits.userMessageCount,
    hasReading: Boolean(conversation.readingId),
    lastUserMessage: lastUser,
  });

  return {
    conversationId: conversation.id,
    messages: conversation.messages.map(toOracleMessageDTO),
    userMessageCount: limits.userMessageCount,
    messageLimit: limits.limit,
    canSend: limits.canSend,
    isPremium: limits.isPremium,
    hasReading: Boolean(conversation.readingId),
    readingId: conversation.readingId,
    suggestCast,
    canCast: !conversation.readingId,
  };
}
