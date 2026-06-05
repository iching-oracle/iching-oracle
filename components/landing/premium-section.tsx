"use client";

import { useReducedMotion } from "framer-motion";
import { PricingPlanCards } from "@/components/pricing/pricing-plan-cards";
import { SectionHeader } from "@/components/landing/section-header";
import { LANDING_SECTIONS } from "@/lib/landing/content";

type PremiumSectionProps = {
  isLoggedIn: boolean;
};

export function PremiumSection({ isLoggedIn }: PremiumSectionProps) {
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

      <div className="mt-16">
        <PricingPlanCards isLoggedIn={isLoggedIn} variant="landing" />
      </div>
    </section>
  );
}
