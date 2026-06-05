"use client";

import { motion } from "framer-motion";
import { PricingPlanCards } from "@/components/pricing/pricing-plan-cards";
import { TrustBadges } from "@/components/trust/trust-badges";

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
    <div className="relative space-y-20 sm:space-y-24">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="type-eyebrow text-cosmic-violet">Premium</p>
        <h1 className="type-display mt-5 text-4xl sm:text-5xl">
          Deepen your oracle practice
        </h1>
        <p className="type-muted mx-auto mt-5 max-w-lg sm:text-base">
          A calm, trustworthy path to richer I Ching insight — for seekers who
          return for clarity, not noise.
        </p>
      </motion.header>

      <PricingPlanCards
        isLoggedIn={isLoggedIn}
        isPremium={isPremium}
        variant="page"
      />

      <section className="mx-auto max-w-2xl">
        <h2 className="type-display text-center text-2xl sm:text-3xl">FAQ</h2>
        <dl className="mt-10 space-y-5">
          {FAQ.map((item) => (
            <div
              key={item.q}
              className="rounded-xl border border-white/10 bg-zen-elevated/40 px-5 py-5 sm:px-6"
            >
              <dt className="font-medium text-foreground">{item.q}</dt>
              <dd className="type-muted mt-2">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <TrustBadges className="mx-auto mt-12 max-w-3xl" />
    </div>
  );
}
