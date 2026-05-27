"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type GuidedPremiumGateProps = {
  title: string;
  teaser?: string;
};

export function GuidedPremiumGate({ title, teaser }: GuidedPremiumGateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-2xl border border-amber-gold/15 bg-zen-surface/30"
    >
      <div className="pointer-events-none space-y-3 p-6 blur-[6px] select-none" aria-hidden>
        <div className="h-3 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-full rounded bg-white/8" />
        <div className="h-3 w-5/6 rounded bg-white/8" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zen-bg/75 px-6 py-8 text-center backdrop-blur-md">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold/90">
          Deeper insight
        </p>
        <h3 className="mt-2 font-serif text-lg text-foreground">{title}</h3>
        <p className="mt-2 max-w-xs text-sm text-zen-muted">
          {teaser ??
            "Reveal what the oracle has not yet shown — patterns, trajectory, and emotional depth."}
        </p>
        <Link
          href="/pricing"
          className="mt-5 rounded-full border border-amber-gold/40 px-6 py-2 text-xs font-medium text-amber-gold transition-colors hover:bg-amber-gold/10"
        >
          Unlock deeper insight
        </Link>
      </div>
    </motion.div>
  );
}
