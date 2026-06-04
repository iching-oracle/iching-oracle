"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TRUST_PILLARS } from "@/lib/landing/content";
import { SectionHeader } from "@/components/landing/section-header";

const TRUST_ICONS = ["◈", "◇", "◆", "○", "◎"] as const;

export function TrustSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="py-16 sm:py-24"
      aria-labelledby="trust-heading"
    >
      <SectionHeader
        id="trust-heading"
        eyebrow="Trust"
        title="Built for reflection, not spectacle"
        description="A premium spiritual tool should feel as safe as it feels inspiring. Every layer is designed with privacy and calm in mind."
      />

      <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {TRUST_PILLARS.map((pillar, index) => (
          <motion.li
            key={pillar.title}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.06, duration: 0.5 }}
            className={
              index === TRUST_PILLARS.length - 1
                ? "sm:col-span-2 lg:col-span-1"
                : undefined
            }
          >
            <article className="group h-full rounded-2xl border border-white/[0.06] bg-zen-surface/50 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-amber-gold/25 hover:bg-zen-surface/70 sm:p-7">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-amber-gold/20 bg-amber-gold/5 font-serif text-lg text-amber-gold"
                aria-hidden
              >
                {TRUST_ICONS[index]}
              </span>
              <h3 className="mt-4 font-serif text-lg text-foreground">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zen-muted">
                {pillar.description}
              </p>
            </article>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
