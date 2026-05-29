import "server-only";

import type Stripe from "stripe";
import {
  FREE_DAILY_CREDITS,
  PREMIUM_MONTHLY_CREDITS,
} from "@/lib/credits/constants";
import { nextUtcDayStart } from "@/lib/credits/billing-period";
import { resetPremiumCreditsForBillingPeriod } from "@/lib/credits/premium-refill";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import type { SubscriptionStatus } from "@/types/subscription";

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

function periodEndFromSubscription(sub: Stripe.Subscription): Date | null {
  const end = sub.items?.data[0]?.current_period_end;
  if (!end) return null;
  return new Date(end * 1000);
}

/** Sync subscription metadata only — never reset credits here. */
export async function syncUserFromStripeSubscription(
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  let userId: string | undefined = subscription.metadata?.userId?.trim();

  if (!userId) {
    const byCustomer = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
      select: { id: true },
    });
    userId = byCustomer?.id ?? undefined;
  }

  if (!userId) {
    console.error(
      "[stripe-sync] No user for subscription",
      subscription.id,
    );
    return;
  }

  const status = mapStripeSubscriptionStatus(subscription.status);
  const periodEnd = periodEndFromSubscription(subscription);
  const isPremium = status === "premium" && periodEnd && periodEnd > new Date();

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: isPremium ? "premium" : status,
      subscriptionCurrentPeriodEnd: periodEnd,
      premiumUntil: isPremium ? periodEnd : null,
      planType: isPremium ? "PREMIUM" : "FREE",
      monthlyCredits: isPremium ? PREMIUM_MONTHLY_CREDITS : FREE_DAILY_CREDITS,
      creditsResetAt: isPremium ? periodEnd : nextUtcDayStart(),
    },
  });
}

export async function revokePremiumForUser(userId: string): Promise<void> {
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: "canceled",
        stripeSubscriptionId: null,
        subscriptionCurrentPeriodEnd: null,
        premiumUntil: null,
        planType: "FREE",
        credits: FREE_DAILY_CREDITS,
        monthlyCredits: FREE_DAILY_CREDITS,
        lastCreditRefillAt: now,
        creditsResetAt: nextUtcDayStart(now),
        lastCreditRefillPeriodEnd: null,
      },
    });
    await tx.creditTransaction.create({
      data: {
        userId,
        type: "ADD",
        amount: FREE_DAILY_CREDITS,
        reason: "Downgraded to free plan",
      },
    });
  });
}

export async function markPastDue(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionStatus: "past_due" },
  });
}

export async function syncFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId = session.metadata?.userId?.trim();
  if (!userId) return;

  if (session.mode === "subscription" && session.subscription) {
    const subId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
    const subscription = await getStripe().subscriptions.retrieve(subId);
    await syncUserFromStripeSubscription(subscription);
    return;
  }

  if (session.mode === "payment" && session.payment_status === "paid") {
    const customerId =
      typeof session.customer === "string" ? session.customer : null;
    const premiumUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const periodStart = new Date();

    await prisma.user.update({
      where: { id: userId },
      data: {
        premiumUntil,
        subscriptionStatus: "premium",
        subscriptionCurrentPeriodEnd: premiumUntil,
        planType: "PREMIUM",
        monthlyCredits: PREMIUM_MONTHLY_CREDITS,
        creditsResetAt: premiumUntil,
        ...(customerId ? { stripeCustomerId: customerId } : {}),
      },
    });

    await resetPremiumCreditsForBillingPeriod({
      userId,
      periodStart,
      periodEnd: premiumUntil,
      reason: "Premium payment completed",
      stripeInvoiceId: `checkout_${session.id}`,
    });
  }
}
