import "server-only";

import { prisma } from "@/lib/prisma";
import { getAppUrl, getStripe } from "@/lib/stripe";

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await getStripe().customers.create({
    email,
    metadata: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

function getPriceId(): string {
  const priceId = process.env.STRIPE_PRICE_ID_MONTHLY?.trim();
  if (!priceId) {
    throw new Error(
      "STRIPE_PRICE_ID_MONTHLY is not configured. Create a recurring price in Stripe Dashboard.",
    );
  }
  return priceId;
}

export async function createSubscriptionCheckoutSession(params: {
  userId: string;
  email: string;
}): Promise<string> {
  const appUrl = getAppUrl();
  const customerId = await getOrCreateStripeCustomer(
    params.userId,
    params.email,
  );

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: params.userId,
    line_items: [{ price: getPriceId(), quantity: 1 }],
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/payment/cancel`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    metadata: {
      userId: params.userId,
      product: "premium-subscription",
    },
    subscription_data: {
      metadata: { userId: params.userId },
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  return session.url;
}

export async function createBillingPortalSession(
  userId: string,
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    throw new Error("No billing account found. Subscribe to Premium first.");
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${getAppUrl()}/dashboard`,
  });

  return session.url;
}
