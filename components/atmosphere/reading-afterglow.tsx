"use client";

import { motion } from "framer-motion";
import { pickReadingClosing } from "@/lib/atmosphere/copy";
import { gentleEase } from "@/lib/guided-reading/motion";

type ReadingAfterglowProps = {
  seed: string;
};

export function ReadingAfterglow({ seed }: ReadingAfterglowProps) {
  const closing = pickReadingClosing(seed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, ...gentleEase, duration: 1.1 }}
      className="reading-afterglow mt-14 text-center"
      aria-label="Closing reflection"
    >
      <div className="mx-auto mb-5 h-px w-16 bg-gradient-to-r from-transparent via-amber-gold/40 to-transparent" />
      <p className="font-serif text-lg leading-relaxed text-foreground/90 sm:text-xl">
        {closing}
      </p>
      <p className="mt-3 text-xs tracking-wide text-zen-muted/80">
        Take your time before you continue.
      </p>
    </motion.div>
  );
}
