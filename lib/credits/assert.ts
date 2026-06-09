import "server-only";

import {
  CREDIT_COSTS,
  PREMIUM_ONLY_FEATURES,
} from "@/lib/credits/constants";
import { hasEnoughCredits, spendCredits } from "@/lib/credits/balance";
import { getUserPlanLimits, resolvePlanType } from "@/lib/credits/plan";
import { enforceTierAiLimits } from "@/lib/rate-limit";
import { assertGlobalAiCaps } from "@/lib/protection/ai-guard";
import { assertAiEnabled } from "@/lib/protection/maintenance";
import { tierQuotaMessage } from "@/lib/usage-tracking";
import { prisma } from "@/lib/prisma";
import type { CreditFeatureType } from "@/types/credits";
import { CREDIT_ERROR_CODES } from "@/types/credits";

export { getUserPlanLimits };

export async function assertCreditsForFeature(
  userId: string,
  feature: CreditFeatureType,
): Promise<
  | { ok: true; cost: number }
  | { ok: false; code: string; message: string; retryAfterSec?: number }
> {
  const aiMaintenance = assertAiEnabled();
  if (aiMaintenance) {
    return {
      ok: false,
      code: "AI_DISABLED",
      message: "The oracle could not speak clearly. Please try again shortly.",
    };
  }

  const global = await assertGlobalAiCaps();
  if (!global.ok) {
    return {
      ok: false,
      code: CREDIT_ERROR_CODES.RATE_LIMIT,
      message: global.reason,
      retryAfterSec: global.retryAfterSec,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
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
      message:
        "This reflection requires membership. Explore premium for deeper interpretation.",
    };
  }

  const tierLimit = await enforceTierAiLimits({
    userId,
    role: user.role,
  });
  if (!tierLimit.ok) {
    return {
      ok: false,
      code: CREDIT_ERROR_CODES.RATE_LIMIT,
      message: tierQuotaMessage(
        user.role === "ADMIN"
          ? "admin"
          : planType === "PREMIUM"
            ? "premium"
            : "free",
        tierLimit.retryAfterSec,
      ),
      retryAfterSec: tierLimit.retryAfterSec,
    };
  }

  const cost = CREDIT_COSTS[feature] ?? 1;

  if (cost > 0 && !(await hasEnoughCredits(userId, cost))) {
    return {
      ok: false,
      code: CREDIT_ERROR_CODES.INSUFFICIENT,
      message:
        planType === "FREE"
          ? `Not enough consultations remaining (${cost} required). Your allowance refills daily.`
          : `Not enough consultations remaining (${cost} required). Your balance refills on your billing date.`,
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
  | { ok: false; code: string; message: string; retryAfterSec?: number }
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
