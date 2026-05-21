import "server-only";

import { prisma } from "@/lib/prisma";
import type { ChatMessageDTO } from "@/types/chat";
import { getFollowUpLimits } from "@/lib/chat/limits";

export async function getReadingForChat(
  userId: string,
  readingId: string,
) {
  return prisma.reading.findFirst({
    where: { id: readingId, userId },
  });
}

export async function getOrCreateConversation(
  userId: string,
  readingId: string,
) {
  const existing = await prisma.readingConversation.findUnique({
    where: { readingId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (existing) {
    if (existing.userId !== userId) return null;
    return existing;
  }

  return prisma.readingConversation.create({
    data: { readingId, userId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
}

export function toMessageDTO(
  msg: {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
  },
): ChatMessageDTO {
  return {
    id: msg.id,
    role: msg.role === "assistant" ? "assistant" : "user",
    content: msg.content,
    createdAt: msg.createdAt.toISOString(),
  };
}

export async function getFollowUpChatState(
  userId: string,
  readingId: string,
) {
  const conversation = await getOrCreateConversation(userId, readingId);
  if (!conversation) {
    return null;
  }

  const limits = await getFollowUpLimits(userId, conversation.id);

  return {
    conversationId: conversation.id,
    messages: conversation.messages.map(toMessageDTO),
    userMessageCount: limits.userMessageCount,
    messageLimit: limits.limit,
    canSend: limits.canSend,
    isPremium: limits.isPremium,
  };
}

export async function addMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
) {
  const [message] = await Promise.all([
    prisma.conversationMessage.create({
      data: { conversationId, role, content },
    }),
    prisma.readingConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return message;
}
