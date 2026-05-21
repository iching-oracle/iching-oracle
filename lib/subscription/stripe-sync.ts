import "server-only";

import type Stripe from "stripe";
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
    },
  });
}

export async function revokePremiumForUser(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "canceled",
      stripeSubscriptionId: null,
      subscriptionCurrentPeriodEnd: null,
      premiumUntil: null,
    },
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

  const customerId =
    typeof session.customer === "string" ? session.customer : null;

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
    const premiumUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: userId },
      data: {
        premiumUntil,
        subscriptionStatus: "premium",
        subscriptionCurrentPeriodEnd: premiumUntil,
        ...(customerId ? { stripeCustomerId: customerId } : {}),
      },
    });
  }
}
