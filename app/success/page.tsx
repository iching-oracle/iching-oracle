import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PremiumBadge } from "@/components/subscription/PremiumBadge";
import { formatPremiumExpiry } from "@/lib/premium";
import { isPremiumUser } from "@/lib/subscription";
import { syncFromCheckoutSession } from "@/lib/subscription/stripe-sync";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export const metadata = {
  title: "Welcome to Premium | ICHING-ORACLE",
};

export default async function SuccessPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/success");
  }

  const { session_id: sessionId } = await searchParams;

  if (sessionId) {
    try {
      const checkoutSession =
        await getStripe().checkout.sessions.retrieve(sessionId);
      if (checkoutSession.metadata?.userId === session.user.id) {
        await syncFromCheckoutSession(checkoutSession);
      }
    } catch (error) {
      console.error("[success] Session sync failed", error);
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      premiumUntil: true,
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
    },
  });

  const isPremium = user ? isPremiumUser(user) : false;
  const expiryLabel = formatPremiumExpiry(
    user?.subscriptionCurrentPeriodEnd ?? user?.premiumUntil ?? null,
  );

  return (
    <div className="relative flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.12),transparent_70%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-gold/25 bg-zen-surface/90 p-8 text-center shadow-[0_0_80px_-20px_rgba(197,160,89,0.45)] backdrop-blur-xl sm:p-12">
        <div className="flex justify-center">
          <PremiumBadge className="text-xs" />
        </div>
        <h1 className="mt-6 font-serif text-3xl text-foreground">
          Premium unlocked
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-zen-muted">
          The oracle opens wider for you — unlimited readings, advanced AI
          interpretation, and your full spiritual journal.
          {isPremium && expiryLabel
            ? ` Active through ${expiryLabel}.`
            : " Your account will update momentarily if checkout just completed."}
        </p>
        <ul className="mt-6 space-y-2 text-left text-sm text-foreground/85">
          <li className="flex gap-2">
            <span className="text-amber-gold">✦</span>
            Unlimited daily consultations
          </li>
          <li className="flex gap-2">
            <span className="text-amber-gold">✦</span>
            Deep 7-section interpretations
          </li>
          <li className="flex gap-2">
            <span className="text-amber-gold">✦</span>
            Full history & personal notes
          </li>
        </ul>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/reading/new" className="auth-btn-primary text-center">
            Consult the oracle
          </Link>
          <Link href="/dashboard" className="auth-btn-secondary text-center">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
