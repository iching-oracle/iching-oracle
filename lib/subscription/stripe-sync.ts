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
import {
  periodEndFromSubscription,
  periodStartFromSubscription,
  mapStripeSubscriptionStatus,
  subscriptionHasPremiumAccess,
} from "@/lib/subscription/stripe-period";
import { subscriptionIdFromInvoice } from "@/lib/subscription/stripe-invoice";
import {
  extractStripeCustomerId,
  resolveUserForStripe,
  resolveUserFromCheckoutSession,
  resolveUserFromSubscription,
  type StripeUserResolution,
} from "@/lib/subscription/stripe-user-resolve";
import type { SubscriptionStatus } from "@/types/subscription";

export {
  mapStripeSubscriptionStatus,
  subscriptionHasPremiumAccess,
} from "@/lib/subscription/stripe-period";

export type StripeSyncResult = {
  ok: boolean;
  userId: string | null;
  customerId: string | null;
  subscriptionId: string | null;
  resolution: StripeUserResolution["source"];
  message: string;
  isPremium: boolean;
};

export async function retrieveStripeSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  return getStripe().subscriptions.retrieve(subscriptionId, {
    expand: ["items.data"],
  });
}

/** Sync subscription metadata — credits reset only via invoice or explicit activation. */
export async function syncUserFromStripeSubscription(
  subscription: Stripe.Subscription,
  resolution?: StripeUserResolution,
): Promise<StripeSyncResult> {
  const customerId = extractStripeCustomerId(subscription.customer);
  const resolved =
    resolution ??
    (await resolveUserFromSubscription(subscription));

  if (!resolved.userId) {
    return {
      ok: false,
      userId: null,
      customerId,
      subscriptionId: subscription.id,
      resolution: resolved.source,
      message: "No matching user for subscription",
      isPremium: false,
    };
  }

  const userId = resolved.userId;
  const mappedStatus = mapStripeSubscriptionStatus(subscription.status);
  const periodEnd = periodEndFromSubscription(subscription);
  const isPremium = subscriptionHasPremiumAccess(subscription);
  const subscriptionStatus: SubscriptionStatus = isPremium
    ? "premium"
    : mappedStatus === "past_due"
      ? "past_due"
      : mappedStatus;

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId ?? undefined,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus,
      subscriptionCurrentPeriodEnd: periodEnd,
      premiumUntil: isPremium ? periodEnd : null,
      planType: isPremium ? "PREMIUM" : "FREE",
      monthlyCredits: isPremium ? PREMIUM_MONTHLY_CREDITS : FREE_DAILY_CREDITS,
      creditsResetAt: isPremium ? periodEnd : nextUtcDayStart(),
      ...(isPremium
        ? {}
        : {
            credits: FREE_DAILY_CREDITS,
          }),
    },
  });

  return {
    ok: true,
    userId,
    customerId,
    subscriptionId: subscription.id,
    resolution: resolved.source,
    message: isPremium
      ? "Subscription synced as premium"
      : `Subscription synced as ${subscriptionStatus}`,
    isPremium,
  };
}

export async function activatePremiumCreditsForSubscription(params: {
  userId: string;
  subscription: Stripe.Subscription;
  reason: string;
  stripeInvoiceId?: string | null;
}): Promise<void> {
  const periodStart = periodStartFromSubscription(params.subscription);
  const periodEnd = periodEndFromSubscription(params.subscription);

  if (!periodStart || !periodEnd) {
    console.warn("[stripe-sync] Missing billing period for credit activation", {
      userId: params.userId,
      subscriptionId: params.subscription.id,
    });
    return;
  }

  await resetPremiumCreditsForBillingPeriod({
    userId: params.userId,
    periodStart,
    periodEnd,
    reason: params.reason,
    stripeInvoiceId: params.stripeInvoiceId ?? null,
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
): Promise<StripeSyncResult> {
  const resolution = await resolveUserFromCheckoutSession(session);

  if (!resolution.userId) {
    return {
      ok: false,
      userId: null,
      customerId: resolution.customerId,
      subscriptionId: null,
      resolution: resolution.source,
      message: "Checkout completed but no user could be resolved",
      isPremium: false,
    };
  }

  const userId = resolution.userId;

  if (session.mode === "subscription" && session.subscription) {
    const subId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;

    const subscription = await retrieveStripeSubscription(subId);
    const syncResult = await syncUserFromStripeSubscription(
      subscription,
      resolution,
    );

    if (syncResult.isPremium) {
      await activatePremiumCreditsForSubscription({
        userId,
        subscription,
        reason: "Premium subscription activated",
        stripeInvoiceId: `checkout_${session.id}`,
      });
    }

    return syncResult;
  }

  if (session.mode === "payment" && session.payment_status === "paid") {
    const customerId = extractStripeCustomerId(session.customer);
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

    return {
      ok: true,
      userId,
      customerId,
      subscriptionId: null,
      resolution: resolution.source,
      message: "One-time payment synced as premium",
      isPremium: true,
    };
  }

  return {
    ok: false,
    userId,
    customerId: resolution.customerId,
    subscriptionId: null,
    resolution: resolution.source,
    message: `Unhandled checkout mode: ${session.mode}`,
    isPremium: false,
  };
}

/** Client-triggered sync after redirect — fallback when webhooks are delayed. */
export async function syncSubscriptionForUser(
  userId: string,
  checkoutSessionId?: string | null,
): Promise<StripeSyncResult> {
  if (checkoutSessionId?.trim()) {
    const checkoutSession = await getStripe().checkout.sessions.retrieve(
      checkoutSessionId.trim(),
      { expand: ["subscription"] },
    );

    const resolution = await resolveUserForStripe({
      metadataUserId: checkoutSession.metadata?.userId,
      clientReferenceId: checkoutSession.client_reference_id,
      customerId: extractStripeCustomerId(checkoutSession.customer),
      email:
        checkoutSession.customer_email ??
        checkoutSession.customer_details?.email ??
        null,
    });

    if (resolution.userId && resolution.userId !== userId) {
      return {
        ok: false,
        userId,
        customerId: resolution.customerId,
        subscriptionId: null,
        resolution: resolution.source,
        message: "Checkout session belongs to a different user",
        isPremium: false,
      };
    }

    return syncFromCheckoutSession(checkoutSession);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });

  if (!user) {
    return {
      ok: false,
      userId,
      customerId: null,
      subscriptionId: null,
      resolution: "none",
      message: "User not found",
      isPremium: false,
    };
  }

  if (user.stripeSubscriptionId) {
    const subscription = await retrieveStripeSubscription(
      user.stripeSubscriptionId,
    );
    return syncUserFromStripeSubscription(subscription);
  }

  if (user.stripeCustomerId) {
    const subscriptions = await getStripe().subscriptions.list({
      customer: user.stripeCustomerId,
      status: "all",
      limit: 1,
    });

    const active = subscriptions.data.find((sub) =>
      subscriptionHasPremiumAccess(sub),
    );

    if (active) {
      return syncUserFromStripeSubscription(active);
    }
  }

  return {
    ok: true,
    userId,
    customerId: user.stripeCustomerId,
    subscriptionId: user.stripeSubscriptionId,
    resolution: "stripe_customer_id",
    message: "No active Stripe subscription found",
    isPremium: false,
  };
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<StripeSyncResult> {
  const resolution = await resolveUserFromSubscription(subscription);
  const customerId = extractStripeCustomerId(subscription.customer);

  if (!resolution.userId) {
    return {
      ok: false,
      userId: null,
      customerId,
      subscriptionId: subscription.id,
      resolution: resolution.source,
      message: "Subscription deleted but user not found",
      isPremium: false,
    };
  }

  await revokePremiumForUser(resolution.userId);

  return {
    ok: true,
    userId: resolution.userId,
    customerId,
    subscriptionId: subscription.id,
    resolution: resolution.source,
    message: "Subscription deleted; user downgraded to free",
    isPremium: false,
  };
}

export async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  userId: string,
): Promise<{ sync: StripeSyncResult | null; creditsSkipped?: string }> {
  const subId = subscriptionIdFromInvoice(invoice);

  let sync: StripeSyncResult | null = null;

  if (subId) {
    const subscription = await retrieveStripeSubscription(subId);
    sync = await syncUserFromStripeSubscription(subscription);
  }

  const { resetPremiumCreditsFromInvoice } = await import(
    "@/lib/credits/premium-refill"
  );
  const creditResult = await resetPremiumCreditsFromInvoice(invoice, userId);

  return {
    sync,
    creditsSkipped:
      creditResult.ok && creditResult.skipped
        ? creditResult.reason
        : !creditResult.ok
          ? creditResult.reason
          : undefined,
  };
}
