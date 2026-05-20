import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { formatPremiumExpiry, hasPremiumAccess } from "@/lib/premium";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export const metadata = {
  title: "Payment Successful | ICHING-ORACLE",
};

async function syncPremiumFromSession(sessionId: string, userId: string) {
  try {
    const checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);

    if (
      checkoutSession.payment_status === "paid" &&
      checkoutSession.metadata?.userId === userId
    ) {
      const premiumUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      const stripeCustomerId =
        typeof checkoutSession.customer === "string"
          ? checkoutSession.customer
          : undefined;

      await prisma.user.update({
        where: { id: userId },
        data: {
          premiumUntil,
          ...(stripeCustomerId ? { stripeCustomerId } : {}),
          subscriptionStatus: "premium",
        },
      });
    }
  } catch (error) {
    console.error("[payment/success] Session sync failed", error);
  }
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/payment/success");
  }

  const { session_id: sessionId } = await searchParams;

  if (sessionId) {
    await syncPremiumFromSession(sessionId, session.user.id);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { premiumUntil: true },
  });

  const latestReading = await prisma.reading.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const isPremium = hasPremiumAccess(user);
  const expiryLabel = formatPremiumExpiry(user?.premiumUntil ?? null);

  return (
    <div className="relative flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.15),transparent_70%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-zen-surface/80 p-8 text-center shadow-[0_0_60px_-15px_rgba(124,58,237,0.5)] backdrop-blur-xl sm:p-10">
        <p className="text-4xl" aria-hidden>
          🎉
        </p>
        <h1 className="mt-4 font-serif text-2xl font-semibold text-foreground">
          Payment Successful
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zen-muted">
          Your premium interpretation has been unlocked.
          {isPremium && expiryLabel
            ? ` Access is active until ${expiryLabel}.`
            : " Your account will update shortly if you just completed checkout."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {latestReading ? (
            <Link
              href={`/reading/${latestReading.id}`}
              className="auth-btn-primary text-center"
            >
              View latest reading
            </Link>
          ) : null}
          <Link
            href="/dashboard"
            className="auth-btn-secondary text-center"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
