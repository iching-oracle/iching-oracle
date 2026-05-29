import "server-only";

import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export type StripeUserResolution = {
  userId: string | null;
  customerId: string | null;
  source:
    | "metadata"
    | "client_reference"
    | "email"
    | "stripe_customer_id"
    | "customer_email"
    | "none";
};

export function extractStripeCustomerId(
  customer:
    | string
    | Stripe.Customer
    | Stripe.DeletedCustomer
    | null
    | undefined,
): string | null {
  if (!customer) return null;
  if (typeof customer === "string") return customer;
  return customer.id ?? null;
}

export function normalizeStripeEmail(
  email: string | null | undefined,
): string | null {
  const normalized = email?.trim().toLowerCase();
  return normalized || null;
}

async function linkStripeCustomerToUser(
  userId: string,
  customerId: string,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (!user) return;

  if (!user.stripeCustomerId) {
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
    return;
  }

  if (user.stripeCustomerId !== customerId) {
    console.warn("[stripe-user-resolve] Customer ID mismatch", {
      userId,
      storedCustomerId: user.stripeCustomerId,
      incomingCustomerId: customerId,
    });
  }
}

export async function resolveUserIdFromStripeCustomer(
  customerId: string,
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function resolveUserIdFromCustomerEmail(
  customerId: string,
): Promise<string | null> {
  const customer = await getStripe().customers.retrieve(customerId);
  if (customer.deleted) return null;

  const email = normalizeStripeEmail(customer.email);
  if (!email) return null;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, stripeCustomerId: true },
  });

  if (!user) return null;

  if (user.stripeCustomerId && user.stripeCustomerId !== customerId) {
    console.warn("[stripe-user-resolve] Email matched but customer IDs differ", {
      userId: user.id,
      storedCustomerId: user.stripeCustomerId,
      incomingCustomerId: customerId,
    });
    return null;
  }

  if (!user.stripeCustomerId) {
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  return user.id;
}

export async function resolveUserForStripe(params: {
  metadataUserId?: string | null;
  clientReferenceId?: string | null;
  customerId?: string | null;
  email?: string | null;
}): Promise<StripeUserResolution> {
  const customerId = params.customerId ?? null;

  const metadataUserId = params.metadataUserId?.trim();
  if (metadataUserId) {
    const user = await prisma.user.findUnique({
      where: { id: metadataUserId },
      select: { id: true },
    });
    if (user) {
      if (customerId) {
        await linkStripeCustomerToUser(user.id, customerId);
      }
      return {
        userId: user.id,
        customerId,
        source: "metadata",
      };
    }
  }

  const clientReferenceId = params.clientReferenceId?.trim();
  if (clientReferenceId) {
    const user = await prisma.user.findUnique({
      where: { id: clientReferenceId },
      select: { id: true },
    });
    if (user) {
      if (customerId) {
        await linkStripeCustomerToUser(user.id, customerId);
      }
      return {
        userId: user.id,
        customerId,
        source: "client_reference",
      };
    }
  }

  const email = normalizeStripeEmail(params.email);
  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, stripeCustomerId: true },
    });
    if (user) {
      if (customerId) {
        await linkStripeCustomerToUser(user.id, customerId);
      }
      return {
        userId: user.id,
        customerId: customerId ?? user.stripeCustomerId,
        source: "email",
      };
    }
  }

  if (customerId) {
    const byCustomer = await resolveUserIdFromStripeCustomer(customerId);
    if (byCustomer) {
      return {
        userId: byCustomer,
        customerId,
        source: "stripe_customer_id",
      };
    }

    const byCustomerEmail = await resolveUserIdFromCustomerEmail(customerId);
    if (byCustomerEmail) {
      return {
        userId: byCustomerEmail,
        customerId,
        source: "customer_email",
      };
    }
  }

  return { userId: null, customerId, source: "none" };
}

export async function resolveUserFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<StripeUserResolution> {
  const customerId = extractStripeCustomerId(session.customer);
  const email =
    session.customer_email ??
    session.customer_details?.email ??
    null;

  return resolveUserForStripe({
    metadataUserId: session.metadata?.userId,
    clientReferenceId: session.client_reference_id,
    customerId,
    email,
  });
}

export async function resolveUserFromSubscription(
  subscription: Stripe.Subscription,
): Promise<StripeUserResolution> {
  const customerId = extractStripeCustomerId(subscription.customer);

  return resolveUserForStripe({
    metadataUserId: subscription.metadata?.userId,
    customerId,
  });
}

export async function resolveUserFromInvoice(
  invoice: Stripe.Invoice,
): Promise<StripeUserResolution> {
  const customerId = extractStripeCustomerId(invoice.customer);
  const email = normalizeStripeEmail(invoice.customer_email);

  return resolveUserForStripe({
    customerId,
    email,
  });
}
