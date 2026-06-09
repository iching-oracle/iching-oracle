import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { guardStripeRoute } from "@/lib/api/route-guard";
import { RATE_LIMITS } from "@/lib/rate-limit/presets";
import { trackSubscriptionEvent } from "@/lib/analytics/subscription-events";
import { createSubscriptionCheckoutSession } from "@/lib/subscription/stripe-checkout";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const guarded = await guardStripeRoute(
    request,
    "stripe-checkout",
    RATE_LIMITS.stripeCheckout,
  );
  if (guarded) return guarded;

  try {
    await trackSubscriptionEvent("checkout_opened", {
      userId: session.user.id,
    });

    const url = await createSubscriptionCheckoutSession({
      userId: session.user.id,
      email: session.user.email,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[stripe/create-checkout]", error);
    const message =
      error instanceof Error &&
      (error.message.includes("STRIPE") ||
        error.message.includes("STRIPE_PRICE_ID"))
        ? error.message
        : "Unable to start checkout. Please try again in a moment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
