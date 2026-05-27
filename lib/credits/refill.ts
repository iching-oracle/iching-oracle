import "server-only";

import {
  FREE_DAILY_CREDITS,
  PREMIUM_MONTHLY_CREDITS,
} from "@/lib/credits/constants";
import {
  allocationForUser,
  resolvePlanType,
  type UserCreditRecord,
} from "@/lib/credits/plan";
import { prisma } from "@/lib/prisma";
import type { PlanType } from "@/types/credits";

function startOfUtcDay(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function shouldRefillFree(user: UserCreditRecord, now: Date): boolean {
  if (!user.creditsRefreshedAt) return true;
  return user.creditsRefreshedAt < startOfUtcDay();
}

function shouldRefillPremium(
  user: UserCreditRecord,
  now: Date,
): boolean {
  if (!user.creditsRefreshedAt) return true;
  const periodEnd = user.subscriptionCurrentPeriodEnd;
  if (!periodEnd) {
    const dayStart = startOfUtcDay();
    return user.creditsRefreshedAt < dayStart;
  }
  const periodStart = new Date(periodEnd);
  periodStart.setMonth(periodStart.getMonth() - 1);
  return user.creditsRefreshedAt < periodStart;
}

export function computeNextRefillAt(
  user: UserCreditRecord,
  planType: PlanType,
): Date | null {
  const now = new Date();
  if (planType === "FREE") {
    const next = startOfUtcDay();
    next.setUTCDate(next.getUTCDate() + 1);
    return next;
  }

  if (user.subscriptionCurrentPeriodEnd && user.subscriptionCurrentPeriodEnd > now) {
    return user.subscriptionCurrentPeriodEnd;
  }

  const next = new Date(now);
  next.setUTCMonth(next.getUTCMonth() + 1, 1);
  next.setUTCHours(0, 0, 0, 0);
  return next;
}

/** Idempotent refill — call before balance checks. */
export async function ensureCreditsRefreshed(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      planType: true,
      credits: true,
      monthlyCredits: true,
      creditsRefreshedAt: true,
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
      premiumUntil: true,
    },
  });

  if (!user) return;

  const record = user as UserCreditRecord;
  const planType = resolvePlanType(record);
  const now = new Date();
  const needsRefill =
    planType === "PREMIUM"
      ? shouldRefillPremium(record, now)
      : shouldRefillFree(record, now);

  if (!needsRefill) {
    if (user.planType !== planType) {
      await prisma.user.update({
        where: { id: userId },
        data: { planType },
      });
    }
    return;
  }

  const allocation =
    planType === "PREMIUM" ? PREMIUM_MONTHLY_CREDITS : FREE_DAILY_CREDITS;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        planType,
        credits: allocation,
        monthlyCredits: allocation,
        creditsRefreshedAt: now,
      },
    });

    await tx.creditTransaction.create({
      data: {
        userId,
        type: "ADD",
        amount: allocation,
        reason:
          planType === "PREMIUM"
            ? "Monthly premium credit refill"
            : "Daily free credit refill",
      },
    });
  });
}
