import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { trackSubscriptionEvent } from "@/lib/analytics/subscription-events";
import { prisma } from "@/lib/prisma";
import {
  markPastDue,
  revokePremiumForUser,
  syncFromCheckoutSession,
  syncUserFromStripeSubscription,
} from "@/lib/subscription/stripe-sync";
import { resetPremiumCreditsFromInvoice } from "@/lib/credits/premium-refill";
import { logSystemEvent } from "@/lib/monitoring/logger";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

async function isEventProcessed(eventId: string): Promise<boolean> {
  const existing = await prisma.processedStripeEvent.findUnique({
    where: { id: eventId },
  });
  return Boolean(existing);
}

async function markEventProcessed(eventId: string): Promise<void> {
  await prisma.processedStripeEvent.create({ data: { id: eventId } });
}

async function resolveUserIdFromCustomer(
  customerId: string,
): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe/webhook] Signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (await isEventProcessed(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        await syncFromCheckoutSession(checkoutSession);
        if (checkoutSession.metadata?.userId) {
          await trackSubscriptionEvent("subscription_started", {
            userId: checkoutSession.metadata.userId,
          });
          const { trackServerEvent } = await import("@/lib/analytics/server");
          const { ANALYTICS_EVENTS } = await import("@/lib/analytics/events");
          await trackServerEvent(ANALYTICS_EVENTS.PAYMENT_COMPLETED, {
            userId: checkoutSession.metadata.userId,
            properties: {
              plan_type: "PREMIUM",
              source: "stripe",
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncUserFromStripeSubscription(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId =
          subscription.metadata?.userId?.trim() ??
          (await resolveUserIdFromCustomer(
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id,
          ));

        if (userId) {
          await revokePremiumForUser(userId);
          await trackSubscriptionEvent("subscription_canceled", { userId });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;

        if (customerId) {
          const userId = await resolveUserIdFromCustomer(customerId);
          if (userId) {
            const result = await resetPremiumCreditsFromInvoice(invoice, userId);
            if (!result.ok) {
              console.error("[stripe/webhook] Credit refill failed", result.reason);
            }
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;

        if (customerId) {
          const userId = await resolveUserIdFromCustomer(customerId);
          if (userId) {
            await markPastDue(userId);
            await trackSubscriptionEvent("payment_failed", { userId });
          }
        }
        break;
      }

      default:
        break;
    }

    await markEventProcessed(event.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe/webhook] Handler error", event.type, error);
    await logSystemEvent({
      level: "error",
      category: "stripe_webhook",
      message: `Webhook failed: ${event.type}`,
      metadata: {
        eventId: event.id,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
