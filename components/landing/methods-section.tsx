"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DIVINATION_METHODS, LANDING_SECTIONS } from "@/lib/landing/content";
import { SectionHeader } from "@/components/landing/section-header";
import {
  LANDING_VIEWPORT,
  landingInitial,
  landingTransition,
} from "@/lib/landing/motion";

export function MethodsSection() {
  const reduceMotion = useReducedMotion();
  const copy = LANDING_SECTIONS.methods;

  return (
    <section
      id="methods"
      className="landing-section"
      aria-labelledby="methods-heading"
    >
      <SectionHeader
        id="methods-heading"
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {DIVINATION_METHODS.map((method, index) => (
          <motion.li
            key={method.titleEn}
            initial={landingInitial(reduceMotion, 18)}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={LANDING_VIEWPORT}
            transition={landingTransition(reduceMotion, index * 0.12)}
          >
            <article className="landing-card group relative flex h-full flex-col overflow-hidden p-8 sm:p-9">
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-gold/[0.03] to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                aria-hidden
              />
              <p className="relative font-serif text-lg text-amber-gold/85">
                {method.titleZh}
              </p>
              <h3 className="relative mt-2 text-xs font-medium uppercase tracking-[0.22em] text-zen-muted/90">
                {method.titleEn}
              </h3>
              <p className="relative mt-5 flex-1 text-sm leading-[1.75] text-zen-muted/95">
                {method.description}
              </p>
            </article>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
