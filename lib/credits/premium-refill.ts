import "server-only";

import type Stripe from "stripe";
import { PREMIUM_MONTHLY_CREDITS } from "@/lib/credits/constants";
import {
  isDuplicateInvoiceRefill,
  shouldRefillPremiumPeriod,
} from "@/lib/credits/billing-period";
import { prisma } from "@/lib/prisma";

export type PremiumRefillResult =
  | { ok: true; skipped: true; reason: string }
  | { ok: true; skipped: false; quota: number }
  | { ok: false; reason: string };

export function extractInvoiceBillingPeriod(
  invoice: Stripe.Invoice,
): { periodStart: Date; periodEnd: Date } | null {
  const line = invoice.lines?.data?.find((l) => l.period?.start && l.period?.end);
  if (!line?.period?.start || !line?.period?.end) return null;
  return {
    periodStart: new Date(line.period.start * 1000),
    periodEnd: new Date(line.period.end * 1000),
  };
}

export function isSubscriptionInvoice(invoice: Stripe.Invoice): boolean {
  return (
    invoice.billing_reason === "subscription_cycle" ||
    invoice.billing_reason === "subscription_create"
  );
}

/**
 * Reset premium credits to quota for a Stripe billing period.
 * Idempotent per invoice ID and per (userId, periodEnd).
 */
export async function resetPremiumCreditsForBillingPeriod(params: {
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  quota?: number;
  reason: string;
  stripeInvoiceId?: string | null;
}): Promise<PremiumRefillResult> {
  const quota = params.quota ?? PREMIUM_MONTHLY_CREDITS;

  try {
    return await prisma.$transaction(async (tx) => {
      if (params.stripeInvoiceId) {
        const byInvoice = await tx.creditBillingRefill.findUnique({
          where: { stripeInvoiceId: params.stripeInvoiceId },
        });
        if (byInvoice) {
          return { ok: true, skipped: true, reason: "invoice_already_processed" };
        }
      }

      const existingPeriod = await tx.creditBillingRefill.findUnique({
        where: {
          userId_periodEnd: {
            userId: params.userId,
            periodEnd: params.periodEnd,
          },
        },
      });
      if (existingPeriod) {
        return { ok: true, skipped: true, reason: "period_already_refilled" };
      }

      const user = await tx.user.findUnique({
        where: { id: params.userId },
        select: {
          planType: true,
          credits: true,
          monthlyCredits: true,
          lastCreditRefillAt: true,
          lastCreditRefillPeriodEnd: true,
          subscriptionStatus: true,
          subscriptionCurrentPeriodEnd: true,
          premiumUntil: true,
        },
      });

      if (!user) {
        return { ok: false, reason: "user_not_found" };
      }

      if (isDuplicateInvoiceRefill(user.lastCreditRefillPeriodEnd, params.periodEnd)) {
        return { ok: true, skipped: true, reason: "user_period_already_refilled" };
      }

      if (
        !shouldRefillPremiumPeriod(
          {
            planType: user.planType,
            isPremium: true,
            lastCreditRefillAt: user.lastCreditRefillAt,
            lastCreditRefillPeriodEnd: user.lastCreditRefillPeriodEnd,
            subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
          },
          params.periodEnd,
          params.periodStart,
        )
      ) {
        return { ok: true, skipped: true, reason: "refill_not_due" };
      }

      const now = new Date();

      await tx.user.update({
        where: { id: params.userId },
        data: {
          planType: "PREMIUM",
          credits: quota,
          monthlyCredits: quota,
          lastCreditRefillAt: now,
          creditsResetAt: params.periodEnd,
          lastCreditRefillPeriodEnd: params.periodEnd,
          subscriptionCurrentPeriodEnd: params.periodEnd,
          premiumUntil: params.periodEnd,
          subscriptionStatus: "premium",
        },
      });

      await tx.creditBillingRefill.create({
        data: {
          userId: params.userId,
          stripeInvoiceId: params.stripeInvoiceId ?? null,
          periodStart: params.periodStart,
          periodEnd: params.periodEnd,
          quota,
        },
      });

      await tx.creditTransaction.create({
        data: {
          userId: params.userId,
          type: "ADD",
          amount: quota,
          reason: params.reason,
        },
      });

      return { ok: true, skipped: false, quota };
    });
  } catch (error) {
    console.error("[credits] Premium refill failed", error);
    return { ok: false, reason: "transaction_failed" };
  }
}

export async function resetPremiumCreditsFromInvoice(
  invoice: Stripe.Invoice,
  userId: string,
): Promise<PremiumRefillResult> {
  if (invoice.status !== "paid") {
    return { ok: true, skipped: true, reason: "invoice_not_paid" };
  }

  if (!isSubscriptionInvoice(invoice)) {
    return { ok: true, skipped: true, reason: "not_subscription_invoice" };
  }

  const period = extractInvoiceBillingPeriod(invoice);
  if (!period) {
    return { ok: false, reason: "missing_billing_period" };
  }

  const reason =
    invoice.billing_reason === "subscription_create"
      ? "Premium subscription activated"
      : "Monthly premium credit reset";

  return resetPremiumCreditsForBillingPeriod({
    userId,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    reason,
    stripeInvoiceId: invoice.id,
  });
}
