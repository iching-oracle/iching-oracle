"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TRUST_PILLARS, LANDING_SECTIONS } from "@/lib/landing/content";
import { SectionHeader } from "@/components/landing/section-header";
import {
  AiIcon,
  GuidanceIcon,
  HexagramsIcon,
  ShieldIcon,
} from "@/components/landing/how-it-works-icons";
import {
  LANDING_VIEWPORT,
  landingInitial,
  landingTransition,
} from "@/lib/landing/motion";

const TRUST_ICON_MAP = {
  hexagrams: HexagramsIcon,
  ai: AiIcon,
  shield: ShieldIcon,
  guidance: GuidanceIcon,
} as const;

type TrustSectionProps = {
  totalReadings?: number;
  formattedReadingCount?: string;
};

export function TrustSection({
  totalReadings,
  formattedReadingCount,
}: TrustSectionProps) {
  const reduceMotion = useReducedMotion();
  const copy = LANDING_SECTIONS.trust;
  const showStats =
    typeof totalReadings === "number" &&
    totalReadings >= 50 &&
    formattedReadingCount;

  return (
    <section className="landing-section" aria-labelledby="trust-heading">
      <SectionHeader
        id="trust-heading"
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      {showStats ? (
        <motion.p
          className="mx-auto mt-8 max-w-lg text-center text-sm text-zen-muted"
          initial={landingInitial(reduceMotion, 8)}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={LANDING_VIEWPORT}
          transition={landingTransition(reduceMotion)}
        >
          <span className="font-display text-2xl text-amber-gold">
            {formattedReadingCount}
          </span>{" "}
          readings generated and counting
        </motion.p>
      ) : null}

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:gap-6">
        {TRUST_PILLARS.map((pillar, index) => {
          const Icon = TRUST_ICON_MAP[pillar.icon];
          return (
            <motion.li
              key={pillar.title}
              initial={landingInitial(reduceMotion, 16)}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={LANDING_VIEWPORT}
              transition={landingTransition(reduceMotion, index * 0.08)}
            >
              <article className="landing-card group h-full p-6 sm:p-8">
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-amber-gold/15 bg-amber-gold/[0.04] text-amber-gold/90 transition-colors duration-700 group-hover:border-amber-gold/30"
                  aria-hidden
                >
                  <Icon />
                </span>
                <h3 className="font-display mt-5 text-lg font-medium text-foreground sm:text-xl">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-[1.7] text-zen-muted/95">
                  {pillar.description}
                </p>
              </article>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
