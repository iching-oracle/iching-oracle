import "server-only";

import {
  CREDIT_COSTS,
  HOURLY_AI_REQUEST_CAP,
  PREMIUM_ONLY_FEATURES,
} from "@/lib/credits/constants";
import { hasEnoughCredits, spendCredits } from "@/lib/credits/balance";
import { getUserPlanLimits, resolvePlanType } from "@/lib/credits/plan";
import { prisma } from "@/lib/prisma";
import type { CreditFeatureType } from "@/types/credits";
import { CREDIT_ERROR_CODES } from "@/types/credits";

export { getUserPlanLimits };

export async function assertCreditsForFeature(
  userId: string,
  feature: CreditFeatureType,
): Promise<
  | { ok: true; cost: number }
  | { ok: false; code: string; message: string }
> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      planType: true,
      credits: true,
      monthlyCredits: true,
      lifetimeCreditsUsed: true,
      lastCreditRefillAt: true,
      lastCreditRefillPeriodEnd: true,
      creditsResetAt: true,
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
      premiumUntil: true,
    },
  });

  if (!user) {
    return { ok: false, code: "UNAUTHORIZED", message: "User not found" };
  }

  const planType = resolvePlanType(user);
  const limits = getUserPlanLimits(planType);

  if (PREMIUM_ONLY_FEATURES.includes(feature) && !limits.canUseAdvancedFeatures) {
    return {
      ok: false,
      code: CREDIT_ERROR_CODES.PREMIUM_REQUIRED,
      message: "This feature requires Premium. Upgrade for deep interpretation and pattern insights.",
    };
  }

  const cost = CREDIT_COSTS[feature] ?? 1;

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentUsage = await prisma.aIUsage.count({
    where: { userId, createdAt: { gte: hourAgo } },
  });

  if (recentUsage >= HOURLY_AI_REQUEST_CAP) {
    return {
      ok: false,
      code: CREDIT_ERROR_CODES.RATE_LIMIT,
      message: "Too many AI requests. Please pause and try again shortly.",
    };
  }

  if (cost > 0 && !(await hasEnoughCredits(userId, cost))) {
    return {
      ok: false,
      code: CREDIT_ERROR_CODES.INSUFFICIENT,
      message:
        planType === "FREE"
          ? `Not enough credits (${cost} required). Free plan refills ${limits.allocation} credits daily.`
          : `Not enough credits (${cost} required). Your monthly balance refills on your billing date.`,
    };
  }

  return { ok: true, cost };
}

export async function chargeCreditsForFeature(
  userId: string,
  feature: CreditFeatureType,
  options?: { estimatedTokenUsage?: number; reason?: string },
): Promise<
  | { ok: true }
  | { ok: false; code: string; message: string }
> {
  const check = await assertCreditsForFeature(userId, feature);
  if (!check.ok) return check;

  const spend = await spendCredits({
    userId,
    amount: check.cost,
    reason: options?.reason ?? `AI: ${feature}`,
    featureType: feature,
    estimatedTokenUsage: options?.estimatedTokenUsage,
  });

  if (!spend.ok) {
    return {
      ok: false,
      code: CREDIT_ERROR_CODES.INSUFFICIENT,
      message: spend.message,
    };
  }

  return { ok: true };
}
