"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EXAMPLE_READING, LANDING_SECTIONS } from "@/lib/landing/content";
import { SectionHeader } from "@/components/landing/section-header";
import {
  LANDING_VIEWPORT,
  landingInitial,
  landingTransition,
} from "@/lib/landing/motion";

type ExampleReadingSectionProps = {
  isLoggedIn: boolean;
  hexagramTitle: string;
  hexagramChinese: string;
  hexagramJudgment: string;
};

export function ExampleReadingSection({
  isLoggedIn,
  hexagramTitle,
  hexagramChinese,
  hexagramJudgment,
}: ExampleReadingSectionProps) {
  const reduceMotion = useReducedMotion();
  const copy = LANDING_SECTIONS.example;
  const ctaHref = isLoggedIn ? "/reading/guided" : "/register";

  return (
    <section
      id="example-reading"
      className="landing-section"
      aria-labelledby="example-heading"
    >
      <SectionHeader
        id="example-heading"
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <motion.article
        initial={landingInitial(reduceMotion, 20)}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={LANDING_VIEWPORT}
        transition={landingTransition(reduceMotion, 0.1)}
        className="landing-example-card relative mx-auto mt-14 max-w-2xl overflow-hidden p-6 sm:p-9"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cosmic-purple/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-amber-gold/10 blur-3xl"
          aria-hidden
        />

        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold/80">
          {EXAMPLE_READING.eyebrow}
        </p>

        <blockquote className="mt-5 border-l-2 border-amber-gold/30 pl-4">
          <p className="font-display text-lg italic leading-relaxed text-foreground/95 sm:text-xl">
            &ldquo;{EXAMPLE_READING.question}&rdquo;
          </p>
        </blockquote>

        <div className="mt-8 flex items-start gap-5 rounded-2xl border border-white/[0.06] bg-zen-bg/40 p-5 sm:p-6">
          <div
            className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl border border-amber-gold/20 bg-amber-gold/[0.06] px-4 py-3"
            aria-hidden
          >
            <span className="font-display text-3xl font-medium text-amber-gold">
              {EXAMPLE_READING.hexagramNumber}
            </span>
            <span className="font-serif text-2xl text-amber-gold/90">
              {hexagramChinese}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-xl font-medium text-foreground sm:text-2xl">
              {hexagramTitle}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-zen-muted/90 sm:text-sm">
              {hexagramJudgment}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/[0.04] bg-zen-surface/50 p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-zen-muted">
            AI interpretation
          </p>
          <p className="mt-3 text-sm leading-[1.8] text-foreground/90 sm:text-base">
            {EXAMPLE_READING.interpretationPreview}
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <Link href={ctaHref} className="landing-btn-primary w-full sm:w-auto">
            {EXAMPLE_READING.cta}
          </Link>
        </div>
      </motion.article>
    </section>
  );
}
