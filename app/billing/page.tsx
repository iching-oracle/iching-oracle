import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BillingDashboard } from "@/components/billing/billing-dashboard";
import { getCreditBalance } from "@/lib/credits/balance";
import {
  getTransactionHistory,
  getUsageHistory,
} from "@/lib/credits/history";

import { buildNoIndexMetadata } from "@/lib/seo/noindex-metadata";

export const metadata = buildNoIndexMetadata({
  title: "Membership & usage",
  description: "Your membership and consultation allowance.",
  path: "/billing",
});

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/billing");
  }

  const [balance, usage, transactions] = await Promise.all([
    getCreditBalance(session.user.id),
    getUsageHistory(session.user.id, 25),
    getTransactionHistory(session.user.id, 25),
  ]);

  if (!balance) {
    redirect("/login");
  }

  return (
    <div className="relative mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 sm:py-16">
      <div
        className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-amber-gold/10 blur-[100px]"
        aria-hidden
      />
      <div className="relative space-y-8">
        <div>
          <Link
            href="/dashboard"
            className="text-xs font-medium uppercase tracking-widest text-zen-muted hover:text-amber-gold"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-4 font-serif text-3xl text-foreground">
            Billing & credits
          </h1>
          <p className="mt-2 text-sm text-zen-muted">
            Your plan, credit balance, and AI usage history
          </p>
        </div>

        <BillingDashboard
          balance={balance}
          usage={usage}
          transactions={transactions}
        />
      </div>
    </div>
  );
}
