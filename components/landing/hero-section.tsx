"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { LANDING_HERO } from "@/lib/landing/content";
import {
  LANDING_DURATION,
  LANDING_EASE,
  landingInitial,
  landingTransition,
} from "@/lib/landing/motion";
import { HexagramMark } from "@/components/landing/hexagram-mark";

type HeroSectionProps = {
  isLoggedIn: boolean;
};

export function HeroSection({ isLoggedIn }: HeroSectionProps) {
  const reduceMotion = useReducedMotion();
  const primaryHref = isLoggedIn ? "/reading/guided" : "/register";
  const primaryLabel = isLoggedIn
    ? LANDING_HERO.loggedInPrimaryCta
    : LANDING_HERO.primaryCta;

  return (
    <section
      className="relative flex flex-col items-center px-1 pb-4 pt-14 text-center sm:pt-24 sm:pb-8 lg:pt-32"
      aria-labelledby="hero-heading"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: LANDING_DURATION, ease: LANDING_EASE }}
        className="landing-hero-frame mb-12 sm:mb-14"
      >
        <HexagramMark />
      </motion.div>

      <motion.p
        className="type-eyebrow"
        initial={landingInitial(reduceMotion, 8)}
        animate={{ opacity: 1, y: 0 }}
        transition={landingTransition(reduceMotion, 0.15)}
      >
        {LANDING_HERO.eyebrow}
      </motion.p>

      <motion.h1
        id="hero-heading"
        className="font-display mt-6 max-w-4xl text-4xl font-medium leading-[1.12] tracking-tight text-foreground sm:text-5xl md:text-[3.35rem] md:leading-[1.1]"
        initial={landingInitial(reduceMotion, 22)}
        animate={{ opacity: 1, y: 0 }}
        transition={landingTransition(reduceMotion, 0.28)}
      >
        <span className="bg-gradient-to-b from-foreground via-foreground/96 to-foreground/78 bg-clip-text text-transparent">
          {LANDING_HERO.headline}
        </span>
      </motion.h1>

      <motion.p
        className="mt-7 max-w-xl text-base leading-[1.75] text-zen-muted/95 sm:text-lg sm:leading-[1.8]"
        initial={landingInitial(reduceMotion, 14)}
        animate={{ opacity: 1, y: 0 }}
        transition={landingTransition(reduceMotion, 0.42)}
      >
        {LANDING_HERO.subheadline}
      </motion.p>

      <motion.div
        className="mt-12 flex w-full max-w-md flex-col gap-4 sm:max-w-none sm:flex-row sm:justify-center sm:gap-5"
        initial={landingInitial(reduceMotion, 12)}
        animate={{ opacity: 1, y: 0 }}
        transition={landingTransition(reduceMotion, 0.55)}
      >
        <Link href={primaryHref} className="landing-btn-primary w-full sm:w-auto">
          {primaryLabel}
        </Link>
        <Link href="/pricing" className="landing-btn-secondary w-full sm:w-auto">
          {LANDING_HERO.secondaryCta}
        </Link>
      </motion.div>

      <motion.p
        className="mt-10 text-xs tracking-wide text-zen-muted/75"
        initial={landingInitial(reduceMotion, 6)}
        animate={{ opacity: 1, y: 0 }}
        transition={landingTransition(reduceMotion, 0.68, 0.7)}
      >
        {LANDING_HERO.footnote}
      </motion.p>
    </section>
  );
}
