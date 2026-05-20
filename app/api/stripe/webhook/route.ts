import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const PREMIUM_DURATION_MS = 365 * 24 * 60 * 60 * 1000;

async function grantPremiumAccess(
  userId: string,
  stripeCustomerId: string | null,
) {
  const premiumUntil = new Date(Date.now() + PREMIUM_DURATION_MS);

  await prisma.user.update({
    where: { id: userId },
    data: {
      premiumUntil,
      ...(stripeCustomerId ? { stripeCustomerId } : {}),
      subscriptionStatus: "premium",
    },
  });
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

  try {
    if (event.type === "checkout.session.completed") {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const userId = checkoutSession.metadata?.userId;

      if (!userId) {
        console.error("[stripe/webhook] Missing userId in session metadata");
        return NextResponse.json({ received: true });
      }

      const stripeCustomerId =
        typeof checkoutSession.customer === "string"
          ? checkoutSession.customer
          : null;

      await grantPremiumAccess(userId, stripeCustomerId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe/webhook] Handler error", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
