"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PriceAmount } from "@/components/pricing/price-amount";
import { UpgradeCheckoutButton } from "@/components/subscription/UpgradeCheckoutButton";
import {
  FREE_PLAN_FEATURES,
  PREMIUM_PLAN_FEATURES,
  formatPremiumPrice,
} from "@/lib/landing/plans";

type PricingPlanCardsProps = {
  isLoggedIn: boolean;
  isPremium?: boolean;
  variant?: "landing" | "page";
};

export function PricingPlanCards({
  isLoggedIn,
  isPremium = false,
  variant = "page",
}: PricingPlanCardsProps) {
  const price = formatPremiumPrice();
  const freeCta = isLoggedIn
    ? variant === "landing"
      ? "Continue your practice"
      : "Continue free"
    : variant === "landing"
      ? "Create free account"
      : "Create account";
  const freeHref = isLoggedIn ? "/reading/guided" : "/register";

  return (
    <div className="mx-auto grid max-w-4xl gap-7 lg:grid-cols-2 lg:gap-9">
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        className="pricing-card"
      >
        <p className="pricing-card__eyebrow">Free</p>
        <PriceAmount value="€0" />
        <p className="pricing-card__tagline">Begin in stillness</p>
        <ul className="pricing-card__features">
          {FREE_PLAN_FEATURES.map((feature) => (
            <li
              key={feature}
              className="flex gap-3 text-sm leading-relaxed text-foreground/85"
            >
              <span className="mt-0.5 text-zen-muted/55" aria-hidden>
                —
              </span>
              {feature}
            </li>
          ))}
        </ul>
        <div className="pricing-card__cta">
          <Link
            href={freeHref}
            className={
              variant === "landing"
                ? "landing-btn-secondary inline-flex w-full justify-center"
                : "auth-btn-secondary inline-flex w-full justify-center"
            }
          >
            {freeCta}
          </Link>
        </div>
      </motion.article>

      <motion.article
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
        className="pricing-card pricing-card--premium relative overflow-hidden"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(197,160,89,0.1),transparent_55%)]"
          aria-hidden
        />
        <p className="pricing-card__eyebrow relative text-amber-glow/90">
          Premium
        </p>
        <PriceAmount
          className="relative"
          value={price}
          variant="gold"
          suffix="/ month"
        />
        <p className="pricing-card__tagline relative">
          Cancel anytime · Stripe secure checkout
        </p>
        <ul className="pricing-card__features relative">
          {PREMIUM_PLAN_FEATURES.map((feature) => (
            <li
              key={feature}
              className="flex gap-3 text-sm leading-relaxed text-foreground/90"
            >
              <span className="text-amber-gold/75" aria-hidden>
                ✦
              </span>
              {feature}
            </li>
          ))}
        </ul>
        <div className="pricing-card__cta relative space-y-3">
          {isPremium ? (
            <p className="rounded-lg border border-amber-gold/30 bg-amber-gold/10 px-4 py-3 text-center text-sm text-amber-glow">
              You have Premium access
            </p>
          ) : isLoggedIn ? (
            <UpgradeCheckoutButton
              label={
                variant === "landing"
                  ? "Deepen your practice"
                  : "Start Premium"
              }
              className={
                variant === "landing"
                  ? "landing-btn-primary w-full"
                  : "auth-btn-primary w-full"
              }
              highlighted
            />
          ) : (
            <Link
              href={
                variant === "landing"
                  ? "/register?plan=premium"
                  : "/login?callbackUrl=/pricing"
              }
              className={
                variant === "landing"
                  ? "landing-btn-primary inline-flex w-full justify-center"
                  : "auth-btn-primary inline-flex w-full justify-center"
              }
            >
              {variant === "landing"
                ? "Begin free, deepen later"
                : "Sign in to subscribe"}
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
  );
}
