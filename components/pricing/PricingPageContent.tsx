"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { UpgradeCheckoutButton } from "@/components/subscription/UpgradeCheckoutButton";

const FREE_FEATURES = [
  "3 oracle readings per day",
  "Basic hexagram & placeholder insight",
  "Last 30 saved readings in history",
  "Daily Oracle access",
] as const;

const PREMIUM_FEATURES = [
  "Unlimited readings",
  "Advanced 7-section AI interpretation",
  "Full reading history & personal notes",
  "Changing lines & transformed hexagram analysis",
  "Priority AI quality & future exclusive systems",
  "Premium mystical experience",
] as const;

const FAQ = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Manage your subscription in the dashboard — cancel before renewal and you keep access until the period ends.",
  },
  {
    q: "Is my data private?",
    a: "Your readings and notes belong to you. We never sell personal divination data.",
  },
  {
    q: "What happens if payment fails?",
    a: "We'll notify you by email. Premium features pause until billing is restored — calmly, without pressure.",
  },
] as const;

type PricingPageContentProps = {
  isLoggedIn: boolean;
  isPremium: boolean;
};

export function PricingPageContent({
  isLoggedIn,
  isPremium,
}: PricingPageContentProps) {
  return (
    <div className="relative space-y-20">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-cosmic-violet">
          Premium
        </p>
        <h1 className="mt-4 bg-gradient-to-r from-amber-gold via-amber-glow to-cosmic-violet bg-clip-text font-serif text-4xl font-semibold text-transparent sm:text-5xl">
          Deepen your oracle practice
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-zen-muted sm:text-base">
          A calm, trustworthy path to richer I Ching insight — for seekers who
          return daily for clarity, not noise.
        </p>
      </motion.header>

      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-zen-surface/60 p-8 backdrop-blur-xl"
        >
          <p className="text-xs uppercase tracking-widest text-zen-muted">Free</p>
          <p className="mt-2 font-serif text-3xl text-foreground">€0</p>
          <p className="text-sm text-zen-muted">Begin your journey</p>
          <ul className="mt-6 space-y-3 text-sm text-foreground/85">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-zen-muted">·</span>
                {f}
              </li>
            ))}
          </ul>
          {isLoggedIn ? (
            <Link href="/reading/new" className="auth-btn-secondary mt-8 inline-flex w-full justify-center">
              Continue free
            </Link>
          ) : (
            <Link href="/register" className="auth-btn-secondary mt-8 inline-flex w-full justify-center">
              Create account
            </Link>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl border border-amber-gold/35 bg-gradient-to-br from-zen-surface/95 via-cosmic-deep/30 to-zen-bg/90 p-8 shadow-[0_0_80px_-24px_rgba(197,160,89,0.5)] backdrop-blur-xl"
        >
          <motion.div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(197,160,89,0.12),transparent_60%)]"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity }}
            aria-hidden
          />
          <p className="relative text-xs uppercase tracking-widest text-amber-glow">
            Premium
          </p>
          <p className="relative mt-2 font-serif text-3xl text-amber-gold">
            Monthly
          </p>
          <p className="relative text-sm text-zen-muted">
            Unlimited spiritual depth · cancel anytime
          </p>
          <ul className="relative mt-6 space-y-3 text-sm text-foreground/90">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-amber-gold">✦</span>
                {f}
              </li>
            ))}
          </ul>
          <div className="relative mt-8">
            {isPremium ? (
              <p className="rounded-lg border border-amber-gold/30 bg-amber-gold/10 px-4 py-3 text-center text-sm text-amber-glow">
                You have Premium access
              </p>
            ) : isLoggedIn ? (
              <UpgradeCheckoutButton highlighted label="Start Premium" />
            ) : (
              <Link href="/login?callbackUrl=/pricing" className="auth-btn-primary inline-flex w-full justify-center">
                Sign in to subscribe
              </Link>
            )}
          </div>
        </motion.div>
      </div>

      <section className="mx-auto max-w-2xl">
        <h2 className="text-center font-serif text-2xl text-foreground">FAQ</h2>
        <dl className="mt-8 space-y-6">
          {FAQ.map((item) => (
            <div
              key={item.q}
              className="rounded-xl border border-white/10 bg-zen-elevated/40 px-5 py-4"
            >
              <dt className="font-medium text-foreground">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-zen-muted">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
