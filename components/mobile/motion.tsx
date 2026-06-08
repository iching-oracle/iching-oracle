"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const gentleEase = [0.22, 1, 0.36, 1] as const;

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

/** Subtle entrance — ritual-calm, not bouncy. */
export function FadeIn({ children, className, delay = 0, y = 12 }: FadeInProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, delay, ease: gentleEase }}
    >
      {children}
    </motion.div>
  );
}

type RitualCardProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function RitualCard({ children, className = "", delay = 0 }: RitualCardProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className={`ritual-card ${className}`.trim()}>{children}</div>
    );
  }

  return (
    <motion.div
      className={`ritual-card ${className}`.trim()}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.85, delay, ease: gentleEase }}
    >
      {children}
    </motion.div>
  );
}
