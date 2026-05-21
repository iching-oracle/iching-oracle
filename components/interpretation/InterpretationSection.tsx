"use client";

import { motion } from "framer-motion";
import { StreamingText } from "@/components/interpretation/StreamingText";
import type { InterpretationSection as SectionType } from "@/types/interpretation";

type InterpretationSectionProps = {
  section: SectionType;
  index: number;
  isStreaming?: boolean;
};

export function InterpretationSection({
  section,
  index,
  isStreaming = false,
}: InterpretationSectionProps) {
  if (!section.content.trim() && !isStreaming) {
    return null;
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: "easeOut" }}
      className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-zen-elevated/80 via-zen-surface/60 to-cosmic-deep/20 p-5 sm:p-6"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-gold/10 blur-2xl"
        aria-hidden
      />
      <h3 className="relative text-xs font-medium uppercase tracking-[0.22em] text-amber-gold">
        {section.title}
      </h3>
      <div className="relative mt-3">
        <StreamingText
          content={section.content}
          isStreaming={isStreaming && !section.content.endsWith("\n")}
        />
      </div>
    </motion.article>
  );
}
