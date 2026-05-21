import "server-only";

import { prisma } from "@/lib/prisma";
import type { UsageLimits } from "@/types/subscription";

function isPremiumFromRecord(user: {
  premiumUntil: Date | null;
  subscriptionStatus: string;
  subscriptionCurrentPeriodEnd: Date | null;
}): boolean {
  const now = new Date();
  if (user.subscriptionStatus === "premium") {
    const end = user.subscriptionCurrentPeriodEnd ?? user.premiumUntil;
    if (end && end > now) return true;
  }
  return Boolean(user.premiumUntil && user.premiumUntil > now);
}

export const FREE_DAILY_READING_LIMIT = 3;
export const FREE_HISTORY_MAX_ITEMS = 30;

function startOfUtcDay(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export async function countReadingsToday(userId: string): Promise<number> {
  return prisma.reading.count({
    where: {
      userId,
      createdAt: { gte: startOfUtcDay() },
    },
  });
}

export async function getUsageLimitsForUser(
  userId: string,
): Promise<UsageLimits> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      premiumUntil: true,
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
    },
  });

  const premium = user ? isPremiumFromRecord(user) : false;

  if (premium) {
    return {
      dailyReadingLimit: Infinity,
      dailyReadingsUsed: 0,
      canCreateReading: true,
      historyAccessLimited: false,
      maxHistoryItems: null,
    };
  }

  const used = await countReadingsToday(userId);

  return {
    dailyReadingLimit: FREE_DAILY_READING_LIMIT,
    dailyReadingsUsed: used,
    canCreateReading: used < FREE_DAILY_READING_LIMIT,
    historyAccessLimited: true,
    maxHistoryItems: FREE_HISTORY_MAX_ITEMS,
  };
}

export async function assertCanCreateReading(
  userId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const limits = await getUsageLimitsForUser(userId);
  if (limits.canCreateReading) return { ok: true };

  return {
    ok: false,
    message: `Free plan includes ${FREE_DAILY_READING_LIMIT} readings per day. Upgrade to Premium for unlimited consultations.`,
  };
}
