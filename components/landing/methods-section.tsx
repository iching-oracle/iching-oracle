"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DIVINATION_METHODS } from "@/lib/landing/content";
import { SectionHeader } from "@/components/landing/section-header";

export function MethodsSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="methods"
      className="py-16 sm:py-24"
      aria-labelledby="methods-heading"
    >
      <SectionHeader
        id="methods-heading"
        eyebrow="Divination"
        title="Three paths to the hexagram"
        description="Choose the ritual that matches your moment—each method honors classical I Ching practice."
      />

      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {DIVINATION_METHODS.map((method, index) => (
          <motion.li
            key={method.titleEn}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.07, duration: 0.5 }}
          >
            <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-zen-surface/60 p-7 transition-all duration-400 hover:border-amber-gold/30 hover:shadow-[0_0_48px_-16px_rgba(197,160,89,0.35)] sm:p-8">
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-gold/[0.04] to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                aria-hidden
              />
              <p className="relative font-serif text-lg text-amber-gold/90">
                {method.titleZh}
              </p>
              <h3 className="relative mt-1 font-sans text-sm font-medium uppercase tracking-wider text-zen-muted">
                {method.titleEn}
              </h3>
              <p className="relative mt-4 flex-1 text-sm leading-relaxed text-zen-muted">
                {method.description}
              </p>
            </article>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
