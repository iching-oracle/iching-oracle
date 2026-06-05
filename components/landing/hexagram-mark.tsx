"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LANDING_EASE } from "@/lib/landing/motion";

/** Minimal Li (☲) trigram — matches favicon, readable at small sizes. */
export function HexagramMark({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const lineDuration = 0.85;

  const line = (delay: number, broken = false) =>
    broken ? (
      <div className="flex justify-center gap-3">
        <motion.span
          className="h-2 w-12 rounded-full bg-gradient-to-r from-amber-gold/70 to-amber-glow/80 sm:h-2.5 sm:w-14"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay, duration: lineDuration, ease: LANDING_EASE }}
        />
        <motion.span
          className="h-2 w-12 rounded-full bg-gradient-to-r from-amber-gold/70 to-amber-glow/80 sm:h-2.5 sm:w-14"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.12, duration: lineDuration, ease: LANDING_EASE }}
        />
      </div>
    ) : (
      <motion.div
        className="mx-auto h-2 w-[6.5rem] rounded-full bg-gradient-to-r from-amber-gold/75 via-amber-glow/90 to-amber-gold/75 sm:h-2.5 sm:w-32"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: lineDuration, ease: LANDING_EASE }}
      />
    );

  return (
    <div
      className={`flex flex-col items-center gap-3.5 sm:gap-4 ${className}`}
      aria-hidden
    >
      {line(0)}
      {line(0.2, true)}
      {line(0.4)}
    </div>
  );
}
