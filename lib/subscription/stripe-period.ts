import type Stripe from "stripe";
import type { SubscriptionStatus } from "@/types/subscription";

/** Stripe API 2026+ stores billing period on subscription items, not the root object. */
export function periodEndFromSubscription(
  subscription: Stripe.Subscription,
): Date | null {
  const ends = subscription.items?.data
    ?.map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === "number");

  if (ends?.length) {
    const maxEnd = Math.max(...ends);
    return new Date(maxEnd * 1000);
  }

  const legacy = (subscription as { current_period_end?: number }).current_period_end;
  if (legacy) {
    return new Date(legacy * 1000);
  }

  return null;
}

export function periodStartFromSubscription(
  subscription: Stripe.Subscription,
): Date | null {
  const starts = subscription.items?.data
    ?.map((item) => item.current_period_start)
    .filter((value): value is number => typeof value === "number");

  if (starts?.length) {
    const minStart = Math.min(...starts);
    return new Date(minStart * 1000);
  }

  const legacy = (subscription as { current_period_start?: number }).current_period_start;
  if (legacy) {
    return new Date(legacy * 1000);
  }

  return null;
}

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): SubscriptionStatus {
  switch (status) {
    case "active":
    case "trialing":
      return "premium";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "canceled";
    default:
      return "free";
  }
}

export function subscriptionHasPremiumAccess(
  subscription: Stripe.Subscription,
  now = new Date(),
): boolean {
  const mappedStatus = mapStripeSubscriptionStatus(subscription.status);
  if (mappedStatus !== "premium") {
    return false;
  }

  const periodEnd = periodEndFromSubscription(subscription);
  if (!periodEnd) {
    return true;
  }

  return periodEnd > now;
}
