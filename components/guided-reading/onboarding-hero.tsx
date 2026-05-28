"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GuidedShell } from "@/components/guided-reading/guided-shell";
import { gentleEase } from "@/lib/guided-reading/motion";

type OnboardingHeroProps = {
  onStart: () => void;
};

export function OnboardingHero({ onStart }: OnboardingHeroProps) {
  const reduced = useReducedMotion();

  return (
    <GuidedShell label="Welcome">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ...gentleEase }}
          className="max-w-lg"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-amber-gold/90">
            I Ching Oracle
          </p>

          <h1 className="mt-8 font-serif text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl">
            Ancient Wisdom,
            <span className="mt-2 block bg-gradient-to-r from-amber-gold via-amber-glow to-cosmic-violet bg-clip-text text-transparent">
              Interpreted by AI
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-zen-muted sm:text-xl">
            Ask your question. Receive guidance. Reflect deeper.
          </p>

          <motion.button
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0.1 : 0.6, ...gentleEase }}
            onClick={onStart}
            className="auth-btn-primary mt-12 min-h-[48px] min-w-[220px] px-10 text-base tracking-wide"
          >
            Start Your Reading
          </motion.button>
        </motion.div>

        {!reduced && (
          <motion.div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden
          >
            <motion.div
              className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-cosmic-purple/20 blur-[100px]"
              animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.08, 1] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
          </motion.div>
        )}
      </div>
    </GuidedShell>
  );
}
