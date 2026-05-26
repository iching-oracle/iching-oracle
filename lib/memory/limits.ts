import "server-only";

import {
  FREE_MEMORY_MAX,
  FREE_MEMORY_WINDOW_DAYS,
  PREMIUM_MEMORY_MAX,
} from "@/lib/memory/constants";
import { isPremiumUser } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";

export async function getMemoryLimits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      premiumUntil: true,
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
    },
  });

  const isPremium = user ? isPremiumUser(user) : false;

  return {
    isPremium,
    maxMemories: isPremium ? PREMIUM_MEMORY_MAX : FREE_MEMORY_MAX,
    windowDays: isPremium ? null : FREE_MEMORY_WINDOW_DAYS,
    canUseTimeline: isPremium,
  };
}

export function memoryRetentionCutoff(windowDays: number | null): Date | null {
  if (windowDays == null) return null;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - windowDays);
  return d;
}
