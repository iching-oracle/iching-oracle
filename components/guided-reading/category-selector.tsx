"use client";

import { motion } from "framer-motion";
import { QUESTION_CATEGORIES } from "@/lib/guided-reading/categories";
import type { QuestionCategory } from "@/lib/guided-reading/categories";
import { GuidedShell } from "@/components/guided-reading/guided-shell";
import { GlassCard } from "@/components/guided-reading/glass-card";
import { staggerContainer } from "@/lib/guided-reading/motion";

type CategorySelectorProps = {
  selectedId: QuestionCategory["id"] | null;
  onSelect: (id: QuestionCategory["id"]) => void;
  onContinue: () => void;
  onBack: () => void;
};

export function CategorySelector({
  selectedId,
  onSelect,
  onContinue,
  onBack,
}: CategorySelectorProps) {
  return (
    <GuidedShell label="Choose a theme">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
        <header className="text-center sm:text-left">
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold/80">
            Step 1 of 2
          </p>
          <h2 className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">
            What area of life calls to you?
          </h2>
          <p className="mt-2 text-sm text-zen-muted">
            Choose a theme to shape your question. You may refine it in the next step.
          </p>
        </header>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          {QUESTION_CATEGORIES.map((cat) => (
            <GlassCard
              key={cat.id}
              as="button"
              selected={selectedId === cat.id}
              onClick={() => onSelect(cat.id)}
              className="p-4"
            >
              <span className="text-2xl text-amber-gold" aria-hidden>
                {cat.icon}
              </span>
              <span className="mt-3 block text-sm font-medium text-foreground">
                {cat.label}
              </span>
              <span className="mt-1 block text-[11px] leading-snug text-zen-muted">
                {cat.description}
              </span>
            </GlassCard>
          ))}
        </motion.div>

        <div className="mt-auto flex flex-col gap-3 pt-10 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] text-sm text-zen-muted hover:text-amber-gold"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={onContinue}
            disabled={!selectedId}
            className="auth-btn-primary min-h-[48px] px-8 text-sm disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    </GuidedShell>
  );
}
