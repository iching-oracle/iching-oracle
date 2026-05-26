import "server-only";

import { isPremiumUser } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import { ORACLE_CHAT_ERROR_CODES } from "@/types/oracle-chat";

export const FREE_ORACLE_CHAT_MESSAGES_PER_DAY = 20;
const HOURLY_MESSAGE_CAP = 40;

export async function getOracleChatLimits(
  userId: string,
  conversationId: string,
): Promise<{
  isPremium: boolean;
  userMessageCount: number;
  limit: number | null;
  canSend: boolean;
  dailyUserMessages: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      premiumUntil: true,
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
    },
  });

  const premium = user ? isPremiumUser(user) : false;

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const [userMessageCount, dailyUserMessages] = await Promise.all([
    prisma.oracleMessage.count({
      where: { conversationId, role: "user" },
    }),
    prisma.oracleMessage.count({
      where: {
        role: "user",
        createdAt: { gte: startOfDay },
        conversation: { userId },
      },
    }),
  ]);

  if (premium) {
    return {
      isPremium: true,
      userMessageCount,
      limit: null,
      canSend: true,
      dailyUserMessages,
    };
  }

  return {
    isPremium: false,
    userMessageCount,
    limit: FREE_ORACLE_CHAT_MESSAGES_PER_DAY,
    canSend: dailyUserMessages < FREE_ORACLE_CHAT_MESSAGES_PER_DAY,
    dailyUserMessages,
  };
}

export async function assertCanSendOracleChat(
  userId: string,
  conversationId: string,
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const limits = await getOracleChatLimits(userId, conversationId);

  if (!limits.canSend) {
    return {
      ok: false,
      code: ORACLE_CHAT_ERROR_CODES.MESSAGE_LIMIT,
      message: `Free plan includes ${FREE_ORACLE_CHAT_MESSAGES_PER_DAY} oracle chat messages per day. Premium unlocks unlimited conversation.`,
    };
  }

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.oracleMessage.count({
    where: {
      conversation: { userId },
      role: "user",
      createdAt: { gte: hourAgo },
    },
  });

  if (recentCount >= HOURLY_MESSAGE_CAP) {
    return {
      ok: false,
      code: ORACLE_CHAT_ERROR_CODES.RATE_LIMIT,
      message:
        "You've sent many messages recently. Please pause and return in a little while.",
    };
  }

  return { ok: true };
}
