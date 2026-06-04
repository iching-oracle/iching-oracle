"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Minimal Li (☲) trigram — matches favicon, readable at small sizes. */
export function HexagramMark({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  const line = (delay: number, broken = false) =>
    broken ? (
      <div className="flex justify-center gap-3">
        <motion.span
          className="h-2 w-12 rounded-full bg-gradient-to-r from-amber-gold/80 to-amber-glow sm:h-2.5 sm:w-14"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay, duration: 0.5 }}
        />
        <motion.span
          className="h-2 w-12 rounded-full bg-gradient-to-r from-amber-gold/80 to-amber-glow sm:h-2.5 sm:w-14"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.08, duration: 0.5 }}
        />
      </div>
    ) : (
      <motion.div
        className="mx-auto h-2 w-[6.5rem] rounded-full bg-gradient-to-r from-amber-gold via-amber-glow to-amber-gold sm:h-2.5 sm:w-32"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
      />
    );

  return (
    <div
      className={`flex flex-col items-center gap-3 sm:gap-3.5 ${className}`}
      aria-hidden
    >
      {line(0)}
      {line(0.15, true)}
      {line(0.3)}
    </div>
  );
}
