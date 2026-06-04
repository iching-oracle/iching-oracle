"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LANDING_TESTIMONIALS } from "@/lib/landing/content";
import { SectionHeader } from "@/components/landing/section-header";

export function TestimonialsSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="py-16 sm:py-24"
      aria-labelledby="testimonials-heading"
    >
      <SectionHeader
        id="testimonials-heading"
        eyebrow="Voices"
        title="Seekers who return for clarity"
        description="Placeholder testimonials reflecting the tone we hear from thoughtful users—replace with real stories as you grow."
      />

      <ul className="mt-14 grid gap-6 lg:grid-cols-3">
        {LANDING_TESTIMONIALS.map((item, index) => (
          <motion.li
            key={item.name}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
          >
            <figure className="flex h-full flex-col rounded-2xl border border-white/[0.06] bg-zen-surface/45 p-7 backdrop-blur-sm">
              <blockquote className="flex-1 text-sm leading-relaxed text-foreground/90">
                <span className="font-serif text-2xl leading-none text-amber-gold/50" aria-hidden>
                  &ldquo;
                </span>
                {item.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-white/[0.06] pt-5">
                <p className="text-sm font-medium text-foreground">
                  {item.name}
                </p>
                <p className="text-xs text-zen-muted">{item.role}</p>
              </figcaption>
            </figure>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
