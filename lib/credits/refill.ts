import "server-only";

import { FREE_DAILY_CREDITS } from "@/lib/credits/constants";
import {
  computeCreditsResetAt,
  nextUtcDayStart,
  shouldRefillFreeDaily,
  type RefillEligibilityInput,
} from "@/lib/credits/billing-period";
import { resolvePlanType, type UserCreditRecord } from "@/lib/credits/plan";
import { isPremiumUser } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";

export type FreeRefillResult =
  | { ok: true; skipped: true; reason: string }
  | { ok: true; skipped: false; quota: number }
  | { ok: false; reason: string };

/** Cron-only free tier reset. Never call from page loads or auth. */
export async function refillFreeCreditsIfDue(
  userId: string,
): Promise<FreeRefillResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      planType: true,
      credits: true,
      monthlyCredits: true,
      lastCreditRefillAt: true,
      lastCreditRefillPeriodEnd: true,
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
      premiumUntil: true,
    },
  });

  if (!user) return { ok: false, reason: "user_not_found" };

  const record = user as UserCreditRecord;
  const isPremium = isPremiumUser(user);
  const input: RefillEligibilityInput = {
    planType: user.planType,
    isPremium,
    lastCreditRefillAt: user.lastCreditRefillAt,
    lastCreditRefillPeriodEnd: user.lastCreditRefillPeriodEnd,
    subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
  };

  if (!shouldRefillFreeDaily(input)) {
    const planType = resolvePlanType(record);
    if (user.planType !== planType) {
      await prisma.user.update({
        where: { id: userId },
        data: { planType },
      });
    }
    return { ok: true, skipped: true, reason: "not_due" };
  }

  const now = new Date();
  const nextReset = nextUtcDayStart(now);

  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.user.findUnique({
        where: { id: userId },
        select: {
          planType: true,
          lastCreditRefillAt: true,
          subscriptionStatus: true,
          subscriptionCurrentPeriodEnd: true,
          premiumUntil: true,
        },
      });
      if (!current) throw new Error("USER_NOT_FOUND");
      if (isPremiumUser(current)) throw new Error("PREMIUM_USER");

      const eligibility: RefillEligibilityInput = {
        planType: current.planType,
        isPremium: false,
        lastCreditRefillAt: current.lastCreditRefillAt,
        lastCreditRefillPeriodEnd: null,
        subscriptionCurrentPeriodEnd: current.subscriptionCurrentPeriodEnd,
      };
      if (!shouldRefillFreeDaily(eligibility, now)) {
        throw new Error("NOT_DUE");
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          planType: "FREE",
          credits: FREE_DAILY_CREDITS,
          monthlyCredits: FREE_DAILY_CREDITS,
          lastCreditRefillAt: now,
          creditsResetAt: nextReset,
          lastCreditRefillPeriodEnd: null,
        },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          type: "ADD",
          amount: FREE_DAILY_CREDITS,
          reason: "Daily free credit reset",
        },
      });
    });

    return { ok: true, skipped: false, quota: FREE_DAILY_CREDITS };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_DUE") {
        return { ok: true, skipped: true, reason: "not_due" };
      }
      if (error.message === "PREMIUM_USER") {
        return { ok: true, skipped: true, reason: "premium_user" };
      }
    }
    console.error("[credits] Free refill failed", error);
    return { ok: false, reason: "transaction_failed" };
  }
}

export { computeCreditsResetAt } from "@/lib/credits/billing-period";

export function computeNextRefillAt(
  user: UserCreditRecord & { creditsResetAt?: Date | null },
  planType: ReturnType<typeof resolvePlanType>,
): Date | null {
  if (user.creditsResetAt && user.creditsResetAt > new Date()) {
    return user.creditsResetAt;
  }

  return computeCreditsResetAt(
    {
      planType: user.planType,
      isPremium: planType === "PREMIUM",
      lastCreditRefillAt: user.lastCreditRefillAt,
      lastCreditRefillPeriodEnd: user.lastCreditRefillPeriodEnd,
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
    },
    planType,
  );
}
