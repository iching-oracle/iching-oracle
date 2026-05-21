"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isAdvancedInterpretation, parseInterpretationSections } from "@/lib/interpretation/parse";
import type { InterpretationMode } from "@/types/interpretation";

type ReadingDetailSectionsProps = {
  interpretation: string;
  mode: InterpretationMode;
};

export function ReadingDetailSections({
  interpretation,
  mode,
}: ReadingDetailSectionsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!interpretation.trim()) {
    return (
      <p className="text-sm text-zen-muted">No interpretation available yet.</p>
    );
  }

  const parsed = isAdvancedInterpretation(interpretation)
    ? parseInterpretationSections(interpretation, mode)
    : {
        sections: [
          {
            id: "overall-reading" as const,
            title: "Interpretation",
            content: interpretation,
          },
        ],
        raw: interpretation,
        mode,
      };

  return (
    <div className="space-y-3">
      {parsed.sections.map((section, index) => {
        const isOpen = expandedId === section.id || expandedId === null;
        const canCollapse = parsed.sections.length > 1;

        return (
          <motion.section
            key={section.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="overflow-hidden rounded-xl border border-white/[0.08] bg-zen-elevated/50 backdrop-blur-sm"
          >
            {canCollapse ? (
              <button
                type="button"
                onClick={() =>
                  setExpandedId(expandedId === section.id ? null : section.id)
                }
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
              >
                <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-amber-gold">
                  {section.title}
                </h3>
                <span className="text-zen-muted" aria-hidden>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            ) : (
              <h3 className="px-5 pt-4 text-xs font-medium uppercase tracking-[0.2em] text-amber-gold">
                {section.title}
              </h3>
            )}

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="whitespace-pre-wrap px-5 pb-5 text-base leading-relaxed text-foreground/90">
                    {section.content}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.section>
        );
      })}
    </div>
  );
}
