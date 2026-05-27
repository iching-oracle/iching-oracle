import "server-only";

import type { PremiumUserFields } from "@/lib/premium";
import { prisma } from "@/lib/prisma";
import type {
  SubscriptionStatus,
  UserSubscription,
} from "@/types/subscription";

export type SubscriptionUserRecord = {
  premiumUntil: Date | null;
  subscriptionStatus: string;
  subscriptionCurrentPeriodEnd: Date | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
};

export {
  FREE_DAILY_READING_LIMIT,
  FREE_HISTORY_MAX_ITEMS,
  assertCanCreateReading,
  countReadingsToday,
  getUsageLimitsForUser,
} from "@/lib/subscription/usage";

export {
  getCreditBalance,
  chargeCreditsForFeature,
  assertCreditsForFeature,
  CREDIT_COSTS,
  FREE_DAILY_CREDITS,
  PREMIUM_MONTHLY_CREDITS,
} from "@/lib/credits";

export {
  getOrCreateStripeCustomer,
  createSubscriptionCheckoutSession,
  createBillingPortalSession,
} from "@/lib/subscription/stripe-checkout";

function normalizeStatus(raw: string | null | undefined): SubscriptionStatus {
  if (
    raw === "premium" ||
    raw === "canceled" ||
    raw === "past_due" ||
    raw === "free"
  ) {
    return raw;
  }
  return "free";
}

function resolveActivePeriodEnd(
  user: SubscriptionUserRecord,
): Date | null {
  const candidates = [
    user.subscriptionCurrentPeriodEnd,
    user.premiumUntil,
  ].filter((d): d is Date => d instanceof Date);

  if (candidates.length === 0) return null;
  return candidates.reduce((latest, d) => (d > latest ? d : latest));
}

/** Server-side premium check — never trust the client. */
export function isPremiumUser(
  user: SubscriptionUserRecord | PremiumUserFields | null | undefined,
): boolean {
  if (!user) return false;

  const record = user as SubscriptionUserRecord;
  const status = normalizeStatus(record.subscriptionStatus);
  const periodEnd = resolveActivePeriodEnd(record);
  const now = new Date();

  if (status === "premium" && periodEnd && periodEnd > now) {
    return true;
  }

  if (record.premiumUntil && record.premiumUntil > now) {
    return true;
  }

  return false;
}

export async function getUserSubscription(
  userId: string,
): Promise<UserSubscription | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
      premiumUntil: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });

  if (!user) return null;

  const status = normalizeStatus(user.subscriptionStatus);
  const periodEnd = resolveActivePeriodEnd(user);

  return {
    status: isPremiumUser(user) ? "premium" : status,
    isPremium: isPremiumUser(user),
    currentPeriodEnd: periodEnd,
    premiumUntil: user.premiumUntil,
    stripeCustomerId: user.stripeCustomerId,
    stripeSubscriptionId: user.stripeSubscriptionId,
  };
}

export type PremiumFeature =
  | "advanced_interpretation"
  | "unlimited_readings"
  | "full_history"
  | "regenerate_interpretation"
  | "priority_ai";

export function canAccessPremiumFeature(
  user: SubscriptionUserRecord | null | undefined,
  feature: PremiumFeature,
): boolean {
  if (!isPremiumUser(user)) {
    return false;
  }

  const status = normalizeStatus(user?.subscriptionStatus);
  if (status === "past_due") {
    return feature !== "priority_ai";
  }

  void feature;
  return true;
}
