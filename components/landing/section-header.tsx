"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  LANDING_VIEWPORT,
  landingInitial,
  landingTransition,
} from "@/lib/landing/motion";

type SectionHeaderProps = {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
};

export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  align = "center",
}: SectionHeaderProps) {
  const reduceMotion = useReducedMotion();
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <motion.header
      id={id}
      className={`max-w-2xl ${alignClass}`}
      initial={landingInitial(reduceMotion, 14)}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={LANDING_VIEWPORT}
      transition={landingTransition(reduceMotion)}
    >
      <p className="landing-eyebrow">{eyebrow}</p>
      <h2 className="font-display mt-4 text-2xl font-medium tracking-tight text-foreground sm:text-3xl md:text-[2.35rem] md:leading-tight">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-sm leading-[1.75] text-zen-muted/95 sm:text-base">
          {description}
        </p>
      ) : null}
    </motion.header>
  );
}
