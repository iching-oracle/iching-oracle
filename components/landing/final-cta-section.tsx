"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

type FinalCtaSectionProps = {
  isLoggedIn: boolean;
};

export function FinalCtaSection({ isLoggedIn }: FinalCtaSectionProps) {
  const reduceMotion = useReducedMotion();
  const href = isLoggedIn ? "/reading/guided" : "/register";

  return (
    <section
      className="pb-8 pt-4 sm:pb-12"
      aria-labelledby="final-cta-heading"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="relative overflow-hidden rounded-3xl border border-amber-gold/20 bg-gradient-to-br from-zen-surface/90 via-cosmic-deep/25 to-zen-bg px-8 py-14 text-center sm:px-12 sm:py-16"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.1),transparent_65%)]"
          aria-hidden
        />
        <h2
          id="final-cta-heading"
          className="relative font-serif text-2xl text-foreground sm:text-3xl md:text-4xl"
        >
          Still your mind. Ask the oracle.
        </h2>
        <p className="relative mx-auto mt-4 max-w-md text-sm leading-relaxed text-zen-muted sm:text-base">
          Your next reading is one honest question away. Private, thoughtful, and
          available whenever you need perspective.
        </p>
        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Link href={href} className="auth-btn-primary min-h-[48px] px-10">
            {isLoggedIn ? "Open guided reading" : "Create your free account"}
          </Link>
          <Link href="/daily" className="auth-btn-secondary min-h-[48px] px-10">
            Try daily oracle
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
