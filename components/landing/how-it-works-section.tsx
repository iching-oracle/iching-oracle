"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HOW_IT_WORKS_STEPS, LANDING_SECTIONS } from "@/lib/landing/content";
import { SectionHeader } from "@/components/landing/section-header";
import {
  CastIcon,
  InsightIcon,
  QuestionIcon,
} from "@/components/landing/how-it-works-icons";
import {
  LANDING_VIEWPORT,
  landingInitial,
  landingTransition,
} from "@/lib/landing/motion";

const STEP_ICONS = {
  question: QuestionIcon,
  cast: CastIcon,
  insight: InsightIcon,
} as const;

export function HowItWorksSection() {
  const reduceMotion = useReducedMotion();
  const copy = LANDING_SECTIONS.howItWorks;

  return (
    <section
      id="how-it-works"
      className="landing-section"
      aria-labelledby="how-heading"
    >
      <SectionHeader
        id="how-heading"
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <ol className="relative mt-14 grid gap-6 sm:gap-8 lg:grid-cols-3 lg:gap-8">
        <div
          className="pointer-events-none absolute left-0 right-0 top-[4.5rem] hidden h-px bg-gradient-to-r from-transparent via-amber-gold/15 to-transparent lg:block"
          aria-hidden
        />
        {HOW_IT_WORKS_STEPS.map((item, index) => {
          const Icon = STEP_ICONS[item.icon];
          return (
            <motion.li
              key={item.step}
              initial={landingInitial(reduceMotion, 20)}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={LANDING_VIEWPORT}
              transition={landingTransition(reduceMotion, index * 0.12)}
              className="relative"
            >
              <article className="landing-card flex h-full flex-col bg-gradient-to-b from-zen-surface/70 to-zen-bg/30 p-7 sm:p-8">
                <div className="flex items-center gap-4">
                  <span
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-amber-gold/20 bg-amber-gold/[0.06] text-amber-gold"
                    aria-hidden
                  >
                    <Icon />
                  </span>
                  <span className="font-display text-sm tracking-[0.2em] text-amber-gold/70">
                    Step {item.step}
                  </span>
                </div>
                <h3 className="font-display mt-5 text-xl font-medium text-foreground sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-[1.75] text-zen-muted/95">
                  {item.description}
                </p>
                <motion.div
                  className="mt-6 h-px w-14 bg-gradient-to-r from-amber-gold/50 to-transparent"
                  initial={reduceMotion ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={LANDING_VIEWPORT}
                  transition={{
                    delay: 0.25 + index * 0.1,
                    duration: 0.8,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  style={{ originX: 0 }}
                  aria-hidden
                />
              </article>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
