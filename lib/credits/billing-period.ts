import {
  FREE_DAILY_CREDITS,
  PREMIUM_MONTHLY_CREDITS,
} from "@/lib/credits/constants";
import type { PlanType } from "@/types/credits";

export function startOfUtcDay(date = new Date()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function nextUtcDayStart(from = new Date()): Date {
  const next = startOfUtcDay(from);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

export type RefillEligibilityInput = {
  planType: string;
  isPremium: boolean;
  lastCreditRefillAt: Date | null;
  lastCreditRefillPeriodEnd: Date | null;
  subscriptionCurrentPeriodEnd: Date | null;
};

/** Free users: at most one reset per UTC day (cron-only). */
export function shouldRefillFreeDaily(
  user: RefillEligibilityInput,
  now = new Date(),
): boolean {
  if (user.isPremium || user.planType === "PREMIUM") return false;
  if (!user.lastCreditRefillAt) return true;
  return user.lastCreditRefillAt < startOfUtcDay(now);
}

/** Premium: refill only when billing period advances (Stripe invoice). */
export function shouldRefillPremiumPeriod(
  user: RefillEligibilityInput,
  periodEnd: Date,
  periodStart: Date,
): boolean {
  if (user.lastCreditRefillPeriodEnd && user.lastCreditRefillPeriodEnd >= periodEnd) {
    return false;
  }
  if (user.lastCreditRefillAt && user.lastCreditRefillAt >= periodStart) {
    return false;
  }
  return true;
}

export function computeCreditsResetAt(
  user: RefillEligibilityInput,
  planType: PlanType,
  now = new Date(),
): Date | null {
  if (planType === "PREMIUM") {
    if (user.subscriptionCurrentPeriodEnd && user.subscriptionCurrentPeriodEnd > now) {
      return user.subscriptionCurrentPeriodEnd;
    }
    return null;
  }
  return nextUtcDayStart(now);
}

export function quotaForPlan(planType: PlanType): number {
  return planType === "PREMIUM" ? PREMIUM_MONTHLY_CREDITS : FREE_DAILY_CREDITS;
}

export function isDuplicateInvoiceRefill(
  existingPeriodEnd: Date | null,
  targetPeriodEnd: Date,
): boolean {
  if (!existingPeriodEnd) return false;
  return existingPeriodEnd.getTime() >= targetPeriodEnd.getTime();
}
