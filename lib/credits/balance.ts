import "server-only";

import { LOW_CREDIT_THRESHOLD } from "@/lib/credits/constants";
import { computeNextRefillAt } from "@/lib/credits/refill";
import { resolvePlanType, type UserCreditRecord } from "@/lib/credits/plan";
import { isPremiumUser } from "@/lib/subscription";
import { estimateCostUsd } from "@/lib/usage-tracking";
import { prisma } from "@/lib/prisma";
import type { CreditBalanceDTO, PlanType } from "@/types/credits";

const userSelect = {
  planType: true,
  credits: true,
  monthlyCredits: true,
  lifetimeCreditsUsed: true,
  lastCreditRefillAt: true,
  creditsResetAt: true,
  lastCreditRefillPeriodEnd: true,
  subscriptionStatus: true,
  subscriptionCurrentPeriodEnd: true,
  premiumUntil: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
} as const;

export async function getCreditBalance(
  userId: string,
): Promise<CreditBalanceDTO | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!user) return null;

  const record = user as UserCreditRecord;
  const planType = resolvePlanType(record);
  const nextRefill = computeNextRefillAt(record, planType);

  return {
    planType,
    credits: user.credits,
    monthlyCredits: user.monthlyCredits,
    monthlyCreditQuota: user.monthlyCredits,
    lifetimeCreditsUsed: user.lifetimeCreditsUsed,
    nextRefillAt: nextRefill?.toISOString() ?? null,
    creditsResetAt: user.creditsResetAt?.toISOString() ?? null,
    lastCreditRefillAt: user.lastCreditRefillAt?.toISOString() ?? null,
    lastCreditRefillPeriodEnd:
      user.lastCreditRefillPeriodEnd?.toISOString() ?? null,
    isPremium: isPremiumUser(user),
    subscriptionStatus: user.subscriptionStatus,
    currentPeriodEnd: user.subscriptionCurrentPeriodEnd?.toISOString() ?? null,
    lowCreditWarning: user.credits <= LOW_CREDIT_THRESHOLD,
  };
}

export async function hasEnoughCredits(
  userId: string,
  amount: number,
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  return (user?.credits ?? 0) >= amount;
}

export async function addCredits(
  userId: string,
  amount: number,
  reason: string,
): Promise<void> {
  if (amount <= 0) return;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
    });
    await tx.creditTransaction.create({
      data: { userId, type: "ADD", amount, reason },
    });
  });
}

export async function refundCredits(
  userId: string,
  amount: number,
  reason: string,
): Promise<void> {
  if (amount <= 0) return;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        credits: { increment: amount },
        lifetimeCreditsUsed: { decrement: amount },
      },
    });
    await tx.creditTransaction.create({
      data: { userId, type: "REFUND", amount, reason },
    });
  });
}

export async function spendCredits(params: {
  userId: string;
  amount: number;
  reason: string;
  featureType: string;
  estimatedTokenUsage?: number;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const { userId, amount, reason, featureType, estimatedTokenUsage } = params;

  const estimatedCostUsd =
    estimatedTokenUsage && estimatedTokenUsage > 0
      ? estimateCostUsd(estimatedTokenUsage)
      : null;

  if (amount <= 0) {
    await prisma.aIUsage.create({
      data: {
        userId,
        featureType,
        creditsUsed: 0,
        estimatedTokenUsage,
        estimatedCostUsd,
      },
    });
    return { ok: true };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({
        where: { id: userId, credits: { gte: amount } },
        data: {
          credits: { decrement: amount },
          lifetimeCreditsUsed: { increment: amount },
        },
      });

      if (updated.count === 0) {
        throw new Error("INSUFFICIENT_CREDITS");
      }

      await tx.creditTransaction.create({
        data: {
          userId,
          type: "SPEND",
          amount,
          reason,
        },
      });

      await tx.aIUsage.create({
        data: {
          userId,
          featureType,
          creditsUsed: amount,
          estimatedTokenUsage,
          estimatedCostUsd,
        },
      });
    });

    return { ok: true };
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return {
        ok: false,
        message: "Insufficient credits. Upgrade or wait for your next refill.",
      };
    }
    throw error;
  }
}
