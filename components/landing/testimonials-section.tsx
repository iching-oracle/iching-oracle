"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LANDING_TESTIMONIALS, LANDING_SECTIONS } from "@/lib/landing/content";
import { SectionHeader } from "@/components/landing/section-header";
import {
  LANDING_VIEWPORT,
  landingInitial,
  landingTransition,
} from "@/lib/landing/motion";

export function TestimonialsSection() {
  const reduceMotion = useReducedMotion();
  const copy = LANDING_SECTIONS.testimonials;

  return (
    <section className="landing-section" aria-labelledby="testimonials-heading">
      <SectionHeader
        id="testimonials-heading"
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <ul className="mt-16 grid gap-7 lg:grid-cols-3 lg:gap-8">
        {LANDING_TESTIMONIALS.map((item, index) => (
          <motion.li
            key={item.name}
            initial={landingInitial(reduceMotion, 16)}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={LANDING_VIEWPORT}
            transition={landingTransition(reduceMotion, index * 0.1)}
          >
            <figure className="landing-card flex h-full flex-col p-8">
              <blockquote className="flex-1 text-sm leading-[1.75] text-foreground/88">
                <span
                  className="font-display text-3xl leading-none text-amber-gold/40"
                  aria-hidden
                >
                  &ldquo;
                </span>
                {item.quote}
              </blockquote>
              <figcaption className="mt-7 border-t border-white/[0.05] pt-6">
                <p className="text-sm font-medium text-foreground/95">
                  {item.name}
                </p>
                <p className="mt-1 text-xs text-zen-muted/85">{item.role}</p>
              </figcaption>
            </figure>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
