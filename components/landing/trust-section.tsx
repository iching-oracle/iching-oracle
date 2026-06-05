"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TRUST_PILLARS, LANDING_SECTIONS } from "@/lib/landing/content";
import { SectionHeader } from "@/components/landing/section-header";
import {
  LANDING_VIEWPORT,
  landingInitial,
  landingTransition,
} from "@/lib/landing/motion";

const TRUST_ICONS = ["◈", "◇", "◆", "○", "◎"] as const;

export function TrustSection() {
  const reduceMotion = useReducedMotion();
  const copy = LANDING_SECTIONS.trust;

  return (
    <section className="landing-section" aria-labelledby="trust-heading">
      <SectionHeader
        id="trust-heading"
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {TRUST_PILLARS.map((pillar, index) => (
          <motion.li
            key={pillar.title}
            initial={landingInitial(reduceMotion, 16)}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={LANDING_VIEWPORT}
            transition={landingTransition(reduceMotion, index * 0.1)}
            className={
              index === TRUST_PILLARS.length - 1
                ? "sm:col-span-2 lg:col-span-1"
                : undefined
            }
          >
            <article className="landing-card group h-full p-7 sm:p-8">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-amber-gold/15 bg-amber-gold/[0.04] font-serif text-lg text-amber-gold/90 transition-colors duration-700 group-hover:border-amber-gold/30"
                aria-hidden
              >
                {TRUST_ICONS[index]}
              </span>
              <h3 className="font-display mt-5 text-xl font-medium text-foreground">
                {pillar.title}
              </h3>
              <p className="mt-3 text-sm leading-[1.7] text-zen-muted/95">
                {pillar.description}
              </p>
            </article>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
