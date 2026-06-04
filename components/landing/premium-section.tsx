"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { UpgradeCheckoutButton } from "@/components/subscription/UpgradeCheckoutButton";
import { SectionHeader } from "@/components/landing/section-header";
import {
  FREE_PLAN_FEATURES,
  PREMIUM_PLAN_FEATURES,
  formatPremiumPrice,
} from "@/lib/landing/plans";

type PremiumSectionProps = {
  isLoggedIn: boolean;
};

export function PremiumSection({ isLoggedIn }: PremiumSectionProps) {
  const reduceMotion = useReducedMotion();
  const price = formatPremiumPrice();

  return (
    <section
      id="premium"
      className="py-16 sm:py-24"
      aria-labelledby="premium-heading"
    >
      <SectionHeader
        id="premium-heading"
        eyebrow="Premium"
        title="Go deeper when you're ready"
        description="Start free. Upgrade when you want unlimited readings, full AI depth, and the complete oracle experience."
      />

      <div className="mx-auto mt-14 grid max-w-4xl gap-6 lg:grid-cols-2 lg:gap-8">
        <motion.article
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col rounded-2xl border border-white/10 bg-zen-surface/55 p-8 backdrop-blur-xl sm:p-9"
        >
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-zen-muted">
            Free
          </p>
          <p className="mt-3 font-serif text-4xl text-foreground">€0</p>
          <p className="text-sm text-zen-muted">Begin with intention</p>
          <ul className="mt-8 flex-1 space-y-3.5">
            {FREE_PLAN_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex gap-3 text-sm text-foreground/85"
              >
                <span className="mt-0.5 text-zen-muted" aria-hidden>
                  —
                </span>
                {feature}
              </li>
            ))}
          </ul>
          <Link
            href={isLoggedIn ? "/reading/guided" : "/register"}
            className="auth-btn-secondary mt-8 inline-flex w-full justify-center"
          >
            {isLoggedIn ? "Continue free" : "Create free account"}
          </Link>
        </motion.article>

        <motion.article
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative flex flex-col overflow-hidden rounded-2xl border border-amber-gold/30 bg-gradient-to-br from-zen-surface/95 via-cosmic-deep/20 to-zen-bg p-8 shadow-[0_0_80px_-28px_rgba(197,160,89,0.45)] backdrop-blur-xl sm:p-9"
        >
          <motion.div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(197,160,89,0.14),transparent_55%)]"
            animate={reduceMotion ? undefined : { opacity: [0.35, 0.6, 0.35] }}
            transition={{ duration: 6, repeat: Infinity }}
            aria-hidden
          />
          <p className="relative text-xs font-medium uppercase tracking-[0.25em] text-amber-glow">
            Premium
          </p>
          <p className="relative mt-3 font-serif text-4xl text-amber-gold">
            {price}
            <span className="ml-1 font-sans text-base font-normal text-zen-muted">
              / month
            </span>
          </p>
          <p className="relative text-sm text-zen-muted">
            Cancel anytime · Stripe secure checkout
          </p>
          <ul className="relative mt-8 flex-1 space-y-3.5">
            {PREMIUM_PLAN_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex gap-3 text-sm text-foreground/90"
              >
                <span className="text-amber-gold" aria-hidden>
                  ✦
                </span>
                {feature}
              </li>
            ))}
          </ul>
          <div className="relative mt-8 space-y-3">
            {isLoggedIn ? (
              <UpgradeCheckoutButton
                label="Upgrade to Premium"
                className="auth-btn-primary w-full"
                highlighted
              />
            ) : (
              <Link
                href="/register?plan=premium"
                className="auth-btn-primary inline-flex w-full justify-center"
              >
                Start free, upgrade later
              </Link>
            )}
            <Link
              href="/pricing"
              className="block text-center text-xs text-zen-muted transition-colors hover:text-amber-gold"
            >
              Compare all benefits →
            </Link>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
