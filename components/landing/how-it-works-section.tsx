"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HOW_IT_WORKS_STEPS } from "@/lib/landing/content";
import { SectionHeader } from "@/components/landing/section-header";

export function HowItWorksSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="how-it-works"
      className="py-16 sm:py-24"
      aria-labelledby="how-heading"
    >
      <SectionHeader
        id="how-heading"
        eyebrow="How it works"
        title="From question to clarity in three movements"
        description="The I Ching has guided seekers for millennia. We honor the ritual—and translate it into a flow you can trust."
      />

      <ol className="relative mt-14 grid gap-8 lg:grid-cols-3 lg:gap-6">
        <div
          className="pointer-events-none absolute left-0 right-0 top-16 hidden h-px bg-gradient-to-r from-transparent via-amber-gold/25 to-transparent lg:block"
          aria-hidden
        />
        {HOW_IT_WORKS_STEPS.map((item, index) => (
          <motion.li
            key={item.step}
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: index * 0.1, duration: 0.55 }}
            className="relative"
          >
            <article className="flex h-full flex-col rounded-2xl border border-white/[0.06] bg-gradient-to-b from-zen-surface/80 to-zen-bg/40 p-8 backdrop-blur-sm">
              <span className="font-mono text-xs tracking-widest text-amber-gold/90">
                {item.step}
              </span>
              <h3 className="mt-4 font-serif text-xl text-foreground">
                {item.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-zen-muted">
                {item.description}
              </p>
              <div
                className="mt-6 h-px w-12 bg-gradient-to-r from-amber-gold/60 to-transparent"
                aria-hidden
              />
            </article>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
