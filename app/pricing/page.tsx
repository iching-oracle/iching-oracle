import Link from "next/link";
import { auth } from "@/auth";
import { PricingPageContent } from "@/components/pricing/PricingPageContent";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { isPremiumUser } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";

export const metadata = buildPageMetadata({
  title: "Pricing — Free & Premium I Ching Readings",
  description:
    "Start with free I Ching readings. Upgrade to Premium for unlimited consultations, deeper AI interpretation, and pattern insights.",
  path: "/pricing",
  keywords: [
    "i ching premium",
    "oracle subscription",
    "i ching pricing",
    "ai divination plans",
  ],
});

export default async function PricingPage() {
  const session = await auth();
  let isPremium = false;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        premiumUntil: true,
        subscriptionStatus: true,
        subscriptionCurrentPeriodEnd: true,
      },
    });
    isPremium = user ? isPremiumUser(user) : false;
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-zen-bg">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.12),_transparent_55%)]"
        aria-hidden
      />
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
        <PricingPageContent
          isLoggedIn={Boolean(session?.user)}
          isPremium={isPremium}
        />
        <p className="mt-16 text-center">
          <Link
            href="/"
            className="text-sm text-zen-muted transition-colors hover:text-amber-gold"
          >
            ← Home
          </Link>
        </p>
      </main>
    </div>
  );
}
