"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { LANDING_SECTIONS } from "@/lib/landing/content";
import {
  LANDING_VIEWPORT,
  landingInitial,
  landingTransition,
} from "@/lib/landing/motion";

type FinalCtaSectionProps = {
  isLoggedIn: boolean;
};

export function FinalCtaSection({ isLoggedIn }: FinalCtaSectionProps) {
  const reduceMotion = useReducedMotion();
  const href = isLoggedIn ? "/reading/guided" : "/register";
  const copy = LANDING_SECTIONS.finalCta;

  return (
    <section
      className="pb-10 pt-4 sm:pb-14"
      aria-labelledby="final-cta-heading"
    >
      <motion.div
        initial={landingInitial(reduceMotion, 18)}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={LANDING_VIEWPORT}
        transition={landingTransition(reduceMotion)}
        className="relative overflow-hidden rounded-3xl border border-amber-gold/15 bg-gradient-to-br from-zen-surface/85 via-cosmic-deep/15 to-zen-bg px-8 py-16 text-center sm:px-14 sm:py-20"
      >
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.08),transparent_68%)]"
          animate={reduceMotion ? undefined : { opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
        <h2
          id="final-cta-heading"
          className="relative font-display text-2xl font-medium text-foreground sm:text-3xl md:text-4xl"
        >
          {copy.headline}
        </h2>
        <p className="relative mx-auto mt-5 max-w-md text-sm leading-[1.75] text-zen-muted/95 sm:text-base">
          {copy.subheadline}
        </p>
        <div className="relative mt-10 flex flex-col justify-center gap-4 sm:flex-row sm:gap-5">
          <Link href={href} className="landing-btn-primary px-10">
            {isLoggedIn ? copy.primaryLoggedIn : copy.primaryLoggedOut}
          </Link>
          <Link href="/daily" className="landing-btn-secondary px-10">
            {copy.secondary}
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
