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
      className="relative flex flex-col items-center px-1 pb-6 pt-8 text-center sm:pb-8 sm:pt-20 lg:pt-28"
      aria-labelledby="hero-heading"
    >
      <motion.p
        className="type-eyebrow"
        initial={landingInitial(reduceMotion, 8)}
        animate={{ opacity: 1, y: 0 }}
        transition={landingTransition(reduceMotion, 0.1)}
      >
        {LANDING_HERO.eyebrow}
      </motion.p>

      <motion.h1
        id="hero-heading"
        className="font-display mt-4 max-w-4xl text-[1.75rem] font-medium leading-[1.15] tracking-tight text-foreground sm:mt-6 sm:text-5xl md:text-[3.15rem] md:leading-[1.1]"
        initial={landingInitial(reduceMotion, 18)}
        animate={{ opacity: 1, y: 0 }}
        transition={landingTransition(reduceMotion, 0.2)}
      >
        <span className="bg-gradient-to-b from-foreground via-foreground/96 to-foreground/78 bg-clip-text text-transparent">
          {LANDING_HERO.headline}
        </span>
      </motion.h1>

      <motion.p
        className="mt-4 max-w-xl text-[0.95rem] leading-[1.7] text-zen-muted/95 sm:mt-6 sm:text-lg sm:leading-[1.75]"
        initial={landingInitial(reduceMotion, 12)}
        animate={{ opacity: 1, y: 0 }}
        transition={landingTransition(reduceMotion, 0.32)}
      >
        {LANDING_HERO.subheadline}
      </motion.p>

      <motion.div
        className="mt-7 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4"
        initial={landingInitial(reduceMotion, 10)}
        animate={{ opacity: 1, y: 0 }}
        transition={landingTransition(reduceMotion, 0.44)}
      >
        <Link href={primaryHref} className="landing-btn-primary w-full sm:w-auto">
          {primaryLabel}
        </Link>
        <Link href="/hexagrams" className="landing-btn-secondary w-full sm:w-auto">
          {LANDING_HERO.secondaryCta}
        </Link>
      </motion.div>

      <motion.p
        className="mt-5 text-xs tracking-wide text-zen-muted/75 sm:mt-6"
        initial={landingInitial(reduceMotion, 6)}
        animate={{ opacity: 1, y: 0 }}
        transition={landingTransition(reduceMotion, 0.55, 0.6)}
      >
        {LANDING_HERO.footnote}
      </motion.p>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: LANDING_DURATION, ease: LANDING_EASE, delay: 0.5 }}
        className="landing-hero-frame mt-8 scale-90 sm:mt-12 sm:scale-100 sm:mb-2"
      >
        <HexagramMark />
      </motion.div>
    </section>
  );
}
