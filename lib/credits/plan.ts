import "server-only";

import {
  FREE_DAILY_CREDITS,
  getPlanAllocation,
  PREMIUM_MONTHLY_CREDITS,
} from "@/lib/credits/constants";
import { isPremiumUser, type SubscriptionUserRecord } from "@/lib/subscription";
import type { PlanType } from "@/types/credits";

export type UserCreditRecord = SubscriptionUserRecord & {
  planType: string;
  credits: number;
  monthlyCredits: number;
  lifetimeCreditsUsed: number;
  creditsRefreshedAt: Date | null;
};

export function resolvePlanType(user: UserCreditRecord): PlanType {
  if (user.planType === "PREMIUM" && isPremiumUser(user)) {
    return "PREMIUM";
  }
  if (isPremiumUser(user)) {
    return "PREMIUM";
  }
  return "FREE";
}

export function getUserPlanLimits(planType: PlanType) {
  if (planType === "PREMIUM") {
    return {
      planType,
      allocation: PREMIUM_MONTHLY_CREDITS,
      refillInterval: "billing_cycle" as const,
      canUseDeepInterpretation: true,
      canUsePatternInsight: true,
      canUseAdvancedFeatures: true,
    };
  }

  return {
    planType,
    allocation: FREE_DAILY_CREDITS,
    refillInterval: "daily" as const,
    canUseDeepInterpretation: false,
    canUsePatternInsight: false,
    canUseAdvancedFeatures: false,
  };
}

export function syncPlanTypeFromSubscription(
  user: SubscriptionUserRecord,
  currentPlanType: string,
): PlanType {
  return isPremiumUser(user) ? "PREMIUM" : "FREE";
}

export function allocationForUser(user: UserCreditRecord): number {
  const plan = resolvePlanType(user);
  return user.monthlyCredits > 0
    ? user.monthlyCredits
    : getPlanAllocation(plan);
}
