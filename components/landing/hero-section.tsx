"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { LANDING_HERO } from "@/lib/landing/content";
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
      className="relative flex flex-col items-center px-2 pb-8 pt-12 text-center sm:pt-20 sm:pb-12 lg:pt-28"
      aria-labelledby="hero-heading"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 rounded-3xl border border-white/[0.06] bg-zen-surface/40 px-10 py-8 shadow-[inset_0_1px_0_rgba(197,160,89,0.12)] backdrop-blur-md sm:px-14 sm:py-10"
      >
        <HexagramMark />
      </motion.div>

      <motion.p
        className="text-[10px] font-medium uppercase tracking-[0.35em] text-zen-muted"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {LANDING_HERO.eyebrow}
      </motion.p>

      <motion.h1
        id="hero-heading"
        className="mt-5 max-w-4xl font-serif text-4xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[3.25rem]"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.65 }}
      >
        <span className="bg-gradient-to-b from-foreground via-foreground/95 to-foreground/75 bg-clip-text text-transparent">
          {LANDING_HERO.headline}
        </span>
      </motion.h1>

      <motion.p
        className="mt-6 max-w-xl text-base leading-relaxed text-zen-muted sm:text-lg"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.55 }}
      >
        {LANDING_HERO.subheadline}
      </motion.p>

      <motion.div
        className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
      >
        <Link href={primaryHref} className="auth-btn-primary min-h-[48px] px-8">
          {primaryLabel}
        </Link>
        <Link
          href="/pricing"
          className="auth-btn-secondary min-h-[48px] px-8"
        >
          {LANDING_HERO.secondaryCta}
        </Link>
      </motion.div>

      <motion.p
        className="mt-8 text-xs text-zen-muted/80"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        No credit card required · Free tier available
      </motion.p>
    </section>
  );
}
