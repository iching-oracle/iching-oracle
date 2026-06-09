import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { trackSubscriptionEvent } from "@/lib/analytics/subscription-events";
import { prisma } from "@/lib/prisma";
import {
  extractStripeCustomerId,
  resolveUserFromInvoice,
} from "@/lib/subscription/stripe-user-resolve";
import {
  handleInvoicePaid,
  handleSubscriptionDeleted,
  markPastDue,
  syncFromCheckoutSession,
  syncUserFromStripeSubscription,
  retrieveStripeSubscription,
} from "@/lib/subscription/stripe-sync";
import { logStripeWebhook } from "@/lib/subscription/webhook-log";
import { captureException } from "@/lib/monitoring/sentry";
import { guardStripeRoute } from "@/lib/api/route-guard";
import { recordFailedRequest } from "@/lib/rate-limit/abuse";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isEventProcessed(eventId: string): Promise<boolean> {
  const existing = await prisma.processedStripeEvent.findUnique({
    where: { id: eventId },
  });
  return Boolean(existing);
}

async function markEventProcessed(eventId: string): Promise<void> {
  try {
    await prisma.processedStripeEvent.create({ data: { id: eventId } });
  } catch (error) {
    const isDuplicate =
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "P2002";
    if (!isDuplicate) {
      throw error;
    }
  }
}

function verifyStripeEvent(body: string, signature: string): Stripe.Event {
  const stripe = getStripe();
  const primarySecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const liveSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE?.trim();

  if (!primarySecret && !liveSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  const secrets = [primarySecret, liveSecret].filter(Boolean) as string[];

  let lastError: unknown;
  for (const secret of secrets) {
    try {
      return stripe.webhooks.constructEvent(body, signature, secret);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Invalid Stripe webhook signature");
}

export async function POST(request: Request) {
  const guarded = await guardStripeRoute(request);
  if (guarded) return guarded;

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    void recordFailedRequest(request, "stripe_missing_signature");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Stripe signature verification requires the raw request body (not parsed JSON).
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = verifyStripeEvent(rawBody, signature);
  } catch (error) {
    console.error("[stripe/webhook] Signature verification failed", error);
    void recordFailedRequest(request, "stripe_invalid_signature");
    captureException(error, {
      category: "stripe_webhook",
      tags: { phase: "signature" },
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (await isEventProcessed(event.id)) {
    await logStripeWebhook({
      eventId: event.id,
      eventType: event.type,
      result: "skipped",
      message: "Duplicate event ignored",
    });
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const result = await syncFromCheckoutSession(checkoutSession);

        await logStripeWebhook({
          eventId: event.id,
          eventType: event.type,
          userId: result.userId,
          customerId: result.customerId,
          subscriptionId: result.subscriptionId,
          checkoutSessionId: checkoutSession.id,
          resolutionSource: result.resolution,
          result: result.ok ? "success" : "error",
          message: result.message,
          metadata: { isPremium: result.isPremium },
        });

        if (result.userId && result.isPremium) {
          await trackSubscriptionEvent("subscription_started", {
            userId: result.userId,
          });
          const { trackServerEvent } = await import("@/lib/analytics/server");
          const { ANALYTICS_EVENTS } = await import("@/lib/analytics/events");
          await trackServerEvent(ANALYTICS_EVENTS.PAYMENT_COMPLETED, {
            userId: result.userId,
            properties: {
              plan_type: "PREMIUM",
              source: "stripe",
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscriptionPayload = event.data.object as Stripe.Subscription;
        const subscription = subscriptionPayload.items?.data?.length
          ? subscriptionPayload
          : await retrieveStripeSubscription(subscriptionPayload.id);
        const result = await syncUserFromStripeSubscription(subscription);

        await logStripeWebhook({
          eventId: event.id,
          eventType: event.type,
          userId: result.userId,
          customerId: result.customerId,
          subscriptionId: result.subscriptionId,
          resolutionSource: result.resolution,
          result: result.ok ? "success" : "error",
          message: result.message,
          metadata: { isPremium: result.isPremium },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscriptionPayload = event.data.object as Stripe.Subscription;
        const subscription = subscriptionPayload.items?.data?.length
          ? subscriptionPayload
          : await retrieveStripeSubscription(subscriptionPayload.id);
        const result = await handleSubscriptionDeleted(subscription);

        await logStripeWebhook({
          eventId: event.id,
          eventType: event.type,
          userId: result.userId,
          customerId: result.customerId,
          subscriptionId: result.subscriptionId,
          resolutionSource: result.resolution,
          result: result.ok ? "success" : "error",
          message: result.message,
          metadata: { isPremium: result.isPremium },
        });

        if (result.userId && !result.isPremium) {
          await trackSubscriptionEvent("subscription_canceled", {
            userId: result.userId,
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = extractStripeCustomerId(invoice.customer);
        const resolution = await resolveUserFromInvoice(invoice);

        if (!resolution.userId) {
          await logStripeWebhook({
            eventId: event.id,
            eventType: event.type,
            customerId,
            invoiceId: invoice.id,
            resolutionSource: resolution.source,
            result: "error",
            message: "Invoice paid but no user could be resolved",
          });
          break;
        }

        const { sync, creditsSkipped } = await handleInvoicePaid(
          invoice,
          resolution.userId,
        );

        await logStripeWebhook({
          eventId: event.id,
          eventType: event.type,
          userId: resolution.userId,
          customerId,
          subscriptionId: sync?.subscriptionId ?? undefined,
          invoiceId: invoice.id,
          resolutionSource: resolution.source,
          result: "success",
          message: creditsSkipped
            ? `Invoice processed (credits: ${creditsSkipped})`
            : "Invoice processed and credits synced",
          metadata: {
            isPremium: sync?.isPremium,
            creditsSkipped,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = extractStripeCustomerId(invoice.customer);
        const resolution = await resolveUserFromInvoice(invoice);

        if (resolution.userId) {
          await markPastDue(resolution.userId);
          await trackSubscriptionEvent("payment_failed", {
            userId: resolution.userId,
          });
        }

        await logStripeWebhook({
          eventId: event.id,
          eventType: event.type,
          userId: resolution.userId,
          customerId,
          invoiceId: invoice.id,
          resolutionSource: resolution.source,
          result: resolution.userId ? "success" : "error",
          message: resolution.userId
            ? "Payment failure recorded as past_due"
            : "Payment failed but no user could be resolved",
        });
        break;
      }

      default:
        await logStripeWebhook({
          eventId: event.id,
          eventType: event.type,
          result: "skipped",
          message: "Unhandled event type",
        });
        break;
    }

    await markEventProcessed(event.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe/webhook] Handler error", event.type, error);
    captureException(error, {
      category: "stripe_webhook",
      tags: { event_type: event.type },
      extra: { event_id: event.id },
    });
    await logStripeWebhook({
      eventId: event.id,
      eventType: event.type,
      result: "error",
      message: error instanceof Error ? error.message : "Webhook handler failed",
    });
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
