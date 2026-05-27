"use client";

import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import {
  pickRandomPrompt,
  QUESTION_CATEGORIES,
} from "@/lib/guided-reading/categories";
import { fadeUp, staggerContainer } from "@/lib/guided-reading/motion";
import { RitualAmbient } from "@/components/guided-reading/ritual-ambient";

const MAX_QUESTION = 500;

type QuestionGuideProps = {
  initialQuestion?: string;
  onSubmit: (question: string) => void;
  onBack?: () => void;
};

export function QuestionGuide({
  initialQuestion = "",
  onSubmit,
  onBack,
}: QuestionGuideProps) {
  const [question, setQuestion] = useState(initialQuestion);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const applyPrompt = useCallback((prompt: string) => {
    setQuestion(prompt);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (trimmed.length < 8) return;
    onSubmit(trimmed);
  };

  const category = QUESTION_CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <motion.section
      variants={fadeUp}
      initial="initial"
      animate="animate"
      exit={{ opacity: 0, y: -12 }}
      className="relative min-h-[calc(100dvh-4.5rem)] px-4 py-10 sm:px-6 sm:py-14"
      aria-label="Question inspiration"
    >
      <RitualAmbient />

      <div className="relative z-10 mx-auto max-w-2xl">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold/80">
          Your question
        </p>
        <h2 className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">
          What seeks an answer?
        </h2>
        <p className="mt-2 text-sm text-zen-muted">
          Hold one sincere question in your heart. The oracle responds to clarity.
        </p>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          {QUESTION_CATEGORIES.map((cat) => (
            <motion.button
              key={cat.id}
              type="button"
              variants={fadeUp}
              onClick={() =>
                setActiveCategory((id) => (id === cat.id ? null : cat.id))
              }
              className={`rounded-2xl border p-4 text-left transition-colors ${
                activeCategory === cat.id
                  ? "border-amber-gold/50 bg-amber-gold/10"
                  : "border-white/10 bg-zen-surface/50 hover:border-amber-gold/25"
              }`}
              aria-pressed={activeCategory === cat.id}
            >
              <span className="text-xl text-amber-gold" aria-hidden>
                {cat.icon}
              </span>
              <span className="mt-2 block text-sm font-medium text-foreground">
                {cat.label}
              </span>
              <span className="mt-0.5 block text-[11px] text-zen-muted">
                {cat.description}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {category && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-zen-surface/40 p-4"
          >
            {category.prompts.map((prompt) => (
              <li key={prompt}>
                <button
                  type="button"
                  onClick={() => applyPrompt(prompt)}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-zen-muted transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  {prompt}
                </button>
              </li>
            ))}
          </motion.ul>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="sr-only" htmlFor="guided-question">
            Your question for the oracle
          </label>
          <textarea
            id="guided-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={MAX_QUESTION}
            rows={4}
            placeholder="Speak your question with intention…"
            className="w-full resize-none rounded-2xl border border-white/10 bg-zen-bg/60 px-4 py-4 text-base text-foreground placeholder:text-zen-muted/70 focus:border-amber-gold/40 focus:outline-none focus:ring-1 focus:ring-amber-gold/30"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => applyPrompt(pickRandomPrompt())}
              className="rounded-full border border-white/15 px-4 py-2 text-xs text-zen-muted transition-colors hover:border-amber-gold/30 hover:text-amber-gold"
            >
              Random inspiration
            </button>
            <span className="text-xs text-zen-muted">
              {question.length}/{MAX_QUESTION}
            </span>
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="text-sm text-zen-muted hover:text-amber-gold"
              >
                ← Back
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={question.trim().length < 8}
              className="auth-btn-primary w-full px-8 py-3 text-sm disabled:opacity-40 sm:w-auto"
            >
              Cast the reading
            </button>
          </div>
        </form>
      </div>
    </motion.section>
  );
}
