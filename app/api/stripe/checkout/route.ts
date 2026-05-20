import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getAppUrl,
  getStripe,
  PREMIUM_CURRENCY,
  PREMIUM_PRICE_CENTS,
} from "@/lib/stripe";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const appUrl = getAppUrl();

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: PREMIUM_CURRENCY,
            unit_amount: PREMIUM_PRICE_CENTS,
            product_data: {
              name: "Premium I Ching Reading",
              description: "Unlock detailed AI-powered interpretation",
            },
          },
        },
      ],
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payment/cancel`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
        product: "premium-reading",
      },
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[stripe/checkout]", error);
    const message =
      error instanceof Error &&
      error.message.includes("STRIPE_SECRET_KEY")
        ? "Stripe is not configured. Add STRIPE_SECRET_KEY to .env and restart the dev server."
        : "Unable to start checkout. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
