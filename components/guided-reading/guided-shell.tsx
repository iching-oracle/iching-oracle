"use client";

import { motion } from "framer-motion";
import { RitualAmbient } from "@/components/guided-reading/ritual-ambient";
import { pageVariants, gentleEase } from "@/lib/guided-reading/motion";

type GuidedShellProps = {
  children: React.ReactNode;
  label?: string;
  className?: string;
  dark?: boolean;
};

export function GuidedShell({
  children,
  label,
  className = "",
  dark = false,
}: GuidedShellProps) {
  return (
    <motion.section
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit={{ opacity: 0, y: -12 }}
      transition={gentleEase}
      aria-label={label}
      className={`relative flex min-h-[calc(100dvh-4.5rem)] flex-col ${
        dark ? "bg-black/90" : ""
      } ${className}`}
    >
      <RitualAmbient />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </motion.section>
  );
}
