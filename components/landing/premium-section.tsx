"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { UpgradeCheckoutButton } from "@/components/subscription/UpgradeCheckoutButton";
import { SectionHeader } from "@/components/landing/section-header";
import { LANDING_SECTIONS } from "@/lib/landing/content";
import {
  FREE_PLAN_FEATURES,
  PREMIUM_PLAN_FEATURES,
  formatPremiumPrice,
} from "@/lib/landing/plans";
import {
  LANDING_VIEWPORT,
  landingInitial,
  landingTransition,
} from "@/lib/landing/motion";

type PremiumSectionProps = {
  isLoggedIn: boolean;
};

export function PremiumSection({ isLoggedIn }: PremiumSectionProps) {
  const reduceMotion = useReducedMotion();
  const price = formatPremiumPrice();
  const copy = LANDING_SECTIONS.premium;

  return (
    <section
      id="premium"
      className="landing-section"
      aria-labelledby="premium-heading"
    >
      <SectionHeader
        id="premium-heading"
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <div className="mx-auto mt-16 grid max-w-4xl gap-7 lg:grid-cols-2 lg:gap-9">
        <motion.article
          initial={landingInitial(reduceMotion, 16)}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={LANDING_VIEWPORT}
          transition={landingTransition(reduceMotion)}
          className="landing-card flex flex-col p-8 sm:p-10"
        >
          <p className="landing-eyebrow">Free</p>
          <p className="font-display mt-4 text-4xl font-medium text-foreground">€0</p>
          <p className="mt-2 text-sm text-zen-muted/90">Begin in stillness</p>
          <ul className="mt-9 flex-1 space-y-4">
            {FREE_PLAN_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex gap-3 text-sm leading-relaxed text-foreground/85"
              >
                <span className="mt-0.5 text-zen-muted/60" aria-hidden>
                  —
                </span>
                {feature}
              </li>
            ))}
          </ul>
          <Link
            href={isLoggedIn ? "/reading/guided" : "/register"}
            className="landing-btn-secondary mt-10 inline-flex w-full justify-center"
          >
            {isLoggedIn ? "Continue your practice" : "Create free account"}
          </Link>
        </motion.article>

        <motion.article
          initial={landingInitial(reduceMotion, 16)}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={LANDING_VIEWPORT}
          transition={landingTransition(reduceMotion, 0.12)}
          className="relative flex flex-col overflow-hidden rounded-2xl border border-amber-gold/25 bg-gradient-to-br from-zen-surface/90 via-cosmic-deep/15 to-zen-bg p-8 shadow-[0_0_64px_-28px_rgba(197,160,89,0.35)] sm:p-10"
        >
          <motion.div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(197,160,89,0.12),transparent_55%)]"
            animate={reduceMotion ? undefined : { opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
          <p className="relative landing-eyebrow text-amber-glow/90">Premium</p>
          <p className="relative font-display mt-4 text-4xl font-medium text-amber-gold">
            {price}
            <span className="ml-1 font-sans text-base font-normal text-zen-muted/90">
              / month
            </span>
          </p>
          <p className="relative mt-2 text-sm text-zen-muted/90">
            Cancel anytime · Stripe secure checkout
          </p>
          <ul className="relative mt-9 flex-1 space-y-4">
            {PREMIUM_PLAN_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex gap-3 text-sm leading-relaxed text-foreground/90"
              >
                <span className="text-amber-gold/80" aria-hidden>
                  ✦
                </span>
                {feature}
              </li>
            ))}
          </ul>
          <div className="relative mt-10 space-y-4">
            {isLoggedIn ? (
              <UpgradeCheckoutButton
                label="Deepen your practice"
                className="landing-btn-primary w-full"
                highlighted
              />
            ) : (
              <Link
                href="/register?plan=premium"
                className="landing-btn-primary inline-flex w-full justify-center"
              >
                Begin free, deepen later
              </Link>
            )}
            <Link
              href="/pricing"
              className="block text-center text-xs tracking-wide text-zen-muted/80 transition-colors duration-500 hover:text-amber-gold"
            >
              Compare all benefits →
            </Link>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
