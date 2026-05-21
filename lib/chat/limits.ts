import "server-only";

import { isPremiumUser } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import { FOLLOWUP_ERROR_CODES } from "@/types/chat";

export const FREE_FOLLOWUP_MESSAGES_PER_READING = 3;
const HOURLY_MESSAGE_CAP = 30;

export async function getFollowUpLimits(
  userId: string,
  conversationId: string,
): Promise<{
  isPremium: boolean;
  userMessageCount: number;
  limit: number | null;
  canSend: boolean;
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

  const userMessageCount = await prisma.conversationMessage.count({
    where: { conversationId, role: "user" },
  });

  if (premium) {
    return {
      isPremium: true,
      userMessageCount,
      limit: null,
      canSend: true,
    };
  }

  return {
    isPremium: false,
    userMessageCount,
    limit: FREE_FOLLOWUP_MESSAGES_PER_READING,
    canSend: userMessageCount < FREE_FOLLOWUP_MESSAGES_PER_READING,
  };
}

export async function assertCanSendFollowUp(
  userId: string,
  conversationId: string,
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const limits = await getFollowUpLimits(userId, conversationId);

  if (!limits.canSend) {
    return {
      ok: false,
      code: FOLLOWUP_ERROR_CODES.MESSAGE_LIMIT,
      message: `Free plan includes ${FREE_FOLLOWUP_MESSAGES_PER_READING} follow-up messages per reading. Premium unlocks unlimited guidance.`,
    };
  }

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.conversationMessage.count({
    where: {
      conversation: { userId },
      role: "user",
      createdAt: { gte: hourAgo },
    },
  });

  if (recentCount >= HOURLY_MESSAGE_CAP) {
    return {
      ok: false,
      code: FOLLOWUP_ERROR_CODES.RATE_LIMIT,
      message:
        "You've sent many messages recently. Please pause and return in a little while.",
    };
  }

  return { ok: true };
}
