import type { CreditFeatureType, PlanType } from "@/types/credits";

export const FREE_DAILY_CREDITS = 10;
export const PREMIUM_MONTHLY_CREDITS = 500;
export const LOW_CREDIT_THRESHOLD = 3;

export const CREDIT_COSTS: Record<CreditFeatureType, number> = {
  basic_reading: 1,
  deep_interpretation: 3,
  pattern_insight: 5,
  oracle_chat: 1,
  followup_chat: 1,
  memory_extract: 0,
};

export const PREMIUM_ONLY_FEATURES: CreditFeatureType[] = [
  "deep_interpretation",
  "pattern_insight",
];

export const HOURLY_AI_REQUEST_CAP = 60;

export function getPlanAllocation(planType: PlanType): number {
  return planType === "PREMIUM" ? PREMIUM_MONTHLY_CREDITS : FREE_DAILY_CREDITS;
}
