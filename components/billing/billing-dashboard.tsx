"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ManageSubscriptionButton } from "@/components/subscription/ManageSubscriptionButton";
import { UpgradeCheckoutButton } from "@/components/subscription/UpgradeCheckoutButton";
import { CREDIT_COSTS } from "@/lib/credits/constants";
import { formatDateTime } from "@/lib/format-date";
import type {
  CreditBalanceDTO,
  CreditTransactionRow,
  CreditUsageRow,
} from "@/types/credits";

type BillingDashboardProps = {
  balance: CreditBalanceDTO;
  usage: CreditUsageRow[];
  transactions: CreditTransactionRow[];
};

const FEATURE_LABELS: Record<string, string> = {
  basic_reading: "Basic reading",
  deep_interpretation: "Deep interpretation",
  pattern_insight: "Pattern insight",
  oracle_chat: "Oracle chat",
  followup_chat: "Follow-up chat",
  memory_extract: "Memory extract",
};

export function BillingDashboard({
  balance,
  usage,
  transactions,
}: BillingDashboardProps) {
  const refillLabel = balance.creditsResetAt
    ? formatDateTime(balance.creditsResetAt, "en-US")
    : balance.nextRefillAt
      ? formatDateTime(balance.nextRefillAt, "en-US")
      : "—";

  const lastRefillLabel = balance.lastCreditRefillAt
    ? formatDateTime(balance.lastCreditRefillAt, "en-US")
    : "—";

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-gold/25 bg-gradient-to-br from-amber-gold/10 to-zen-surface/80 p-6 backdrop-blur-xl"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-gold">
            Credits
          </p>
          <p className="mt-2 font-serif text-4xl text-foreground">
            {balance.credits}
          </p>
          <p className="mt-1 text-xs text-zen-muted">
            of {balance.monthlyCreditQuota} this period
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-white/10 bg-zen-surface/70 p-6 backdrop-blur-xl"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-zen-muted">
            Plan
          </p>
          <p className="mt-2 font-serif text-2xl text-foreground">
            {balance.planType === "PREMIUM" ? "Premium" : "Free"}
          </p>
          <p className="mt-1 text-xs capitalize text-zen-muted">
            {balance.subscriptionStatus.replace(/_/g, " ")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-zen-surface/70 p-6 backdrop-blur-xl"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-zen-muted">
            Next reset
          </p>
          <p className="mt-2 text-sm text-foreground">{refillLabel}</p>
          <p className="mt-1 text-xs text-zen-muted">
            Last refill: {lastRefillLabel}
          </p>
          <p className="mt-1 text-xs text-zen-muted">
            Lifetime used: {balance.lifetimeCreditsUsed}
          </p>
        </motion.div>
      </div>

      {balance.isPremium && balance.currentPeriodEnd ? (
        <p className="rounded-xl border border-white/10 bg-zen-surface/50 px-4 py-3 text-sm text-zen-muted">
          Billing cycle ends{" "}
          {formatDateTime(balance.currentPeriodEnd, "en-US")}. Credits reset when
          Stripe confirms your renewal payment.
        </p>
      ) : null}

      {balance.lowCreditWarning ? (
        <p className="rounded-xl border border-amber-gold/30 bg-amber-gold/10 px-4 py-3 text-sm text-amber-gold">
          Credits are running low. Upgrade or wait for your next refill.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {balance.isPremium ? (
          <ManageSubscriptionButton />
        ) : (
          <UpgradeCheckoutButton />
        )}
        <Link href="/pricing" className="auth-btn-secondary text-sm">
          Compare plans
        </Link>
      </div>

      <section className="rounded-2xl border border-white/10 bg-zen-surface/50 p-6">
        <h2 className="text-xs font-medium uppercase tracking-widest text-zen-muted">
          Credit costs
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {Object.entries(CREDIT_COSTS).map(([key, cost]) => (
            <li
              key={key}
              className="flex justify-between rounded-lg border border-white/5 px-3 py-2 text-sm"
            >
              <span className="text-zen-muted">
                {FEATURE_LABELS[key] ?? key}
              </span>
              <span className="text-foreground">{cost} cr</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-zen-surface/50 p-6">
          <h2 className="text-xs font-medium uppercase tracking-widest text-zen-muted">
            Recent usage
          </h2>
          <ul className="mt-4 space-y-2">
            {usage.length === 0 ? (
              <li className="text-sm text-zen-muted">No usage yet</li>
            ) : (
              usage.map((u) => (
                <li
                  key={u.id}
                  className="flex justify-between gap-2 border-b border-white/5 pb-2 text-sm last:border-0"
                >
                  <span className="text-zen-muted">
                    {FEATURE_LABELS[u.featureType] ?? u.featureType}
                  </span>
                  <span className="shrink-0 text-foreground">
                    −{u.creditsUsed}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zen-surface/50 p-6">
          <h2 className="text-xs font-medium uppercase tracking-widest text-zen-muted">
            Transactions
          </h2>
          <ul className="mt-4 space-y-2">
            {transactions.length === 0 ? (
              <li className="text-sm text-zen-muted">No transactions yet</li>
            ) : (
              transactions.map((t) => (
                <li
                  key={t.id}
                  className="border-b border-white/5 pb-2 text-sm last:border-0"
                >
                  <div className="flex justify-between gap-2">
                    <span className="text-zen-muted">{t.reason}</span>
                    <span
                      className={
                        t.type === "SPEND"
                          ? "text-red-300"
                          : "text-emerald-400/90"
                      }
                    >
                      {t.type === "SPEND" ? "−" : "+"}
                      {t.amount}
                    </span>
                  </div>
                  <p
                    className="mt-0.5 text-[10px] text-zen-muted"
                    suppressHydrationWarning
                  >
                    {formatDateTime(t.createdAt, "en-US")}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
