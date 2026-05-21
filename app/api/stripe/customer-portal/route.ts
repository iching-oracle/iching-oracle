import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createBillingPortalSession } from "@/lib/subscription/stripe-checkout";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = await createBillingPortalSession(session.user.id);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[stripe/customer-portal]", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unable to open billing portal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
