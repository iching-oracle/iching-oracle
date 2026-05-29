import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isPremiumUser } from "@/lib/subscription";
import { syncSubscriptionForUser } from "@/lib/subscription/stripe-sync";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SyncBody = {
  sessionId?: string;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let sessionId: string | undefined;
  try {
    const body = (await request.json()) as SyncBody;
    sessionId = body.sessionId?.trim();
  } catch {
    sessionId = undefined;
  }

  try {
    const result = await syncSubscriptionForUser(session.user.id, sessionId);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        planType: true,
        subscriptionStatus: true,
        subscriptionCurrentPeriodEnd: true,
        premiumUntil: true,
        credits: true,
        monthlyCredits: true,
      },
    });

    const isPremium = user ? isPremiumUser(user) : false;

    return NextResponse.json({
      ok: result.ok,
      isPremium,
      planType: user?.planType ?? "FREE",
      subscriptionStatus: user?.subscriptionStatus ?? "free",
      credits: user?.credits ?? 0,
      message: result.message,
      synced: result,
    });
  } catch (error) {
    console.error("[stripe/sync-subscription]", error);
    return NextResponse.json(
      {
        error: "Unable to sync subscription",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
