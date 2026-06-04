"use client";

import { motion, useReducedMotion } from "framer-motion";

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
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-zen-muted">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-sm leading-relaxed text-zen-muted sm:text-base">
          {description}
        </p>
      ) : null}
    </motion.header>
  );
}
