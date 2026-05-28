"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  QUESTION_CATEGORIES,
  pickRandomPrompt,
  type QuestionCategory,
} from "@/lib/guided-reading/categories";
import { GuidedShell } from "@/components/guided-reading/guided-shell";
import { GlassCard } from "@/components/guided-reading/glass-card";
import { gentleEase } from "@/lib/guided-reading/motion";

const ROTATING_PLACEHOLDERS = [
  "What is seeking an answer in your life right now?",
  "What truth are you ready to hear?",
  "Where does your path feel uncertain?",
];

const SUGGESTED_PROMPTS = [
  "Should I change my current job?",
  "What is blocking my relationship?",
  "How should I approach this conflict?",
  "What lesson should I learn now?",
];

const MIN_LENGTH = 12;
const MAX_LENGTH = 500;

type GuidedQuestionInputProps = {
  categoryId: QuestionCategory["id"];
  initialQuestion?: string;
  onSubmit: (question: string) => void;
  onBack: () => void;
};

export function GuidedQuestionInput({
  categoryId,
  initialQuestion = "",
  onSubmit,
  onBack,
}: GuidedQuestionInputProps) {
  const [question, setQuestion] = useState(initialQuestion);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const category = useMemo(
    () => QUESTION_CATEGORIES.find((c) => c.id === categoryId),
    [categoryId],
  );

  const canContinue = question.trim().length >= MIN_LENGTH;

  useEffect(() => {
    const id = window.setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % ROTATING_PLACEHOLDERS.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [question, resizeTextarea]);

  const applyPrompt = (prompt: string) => {
    setQuestion(prompt);
    textareaRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;
    onSubmit(question.trim());
  };

  return (
    <GuidedShell label="Your question">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
        <header>
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold/80">
            Step 2 of 2
            {category ? ` · ${category.label}` : ""}
          </p>
          <h2 className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">
            What situation is currently on your mind?
          </h2>
        </header>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-1 flex-col">
          <label className="sr-only" htmlFor="guided-question">
            Your question
          </label>
          <div className="relative">
            <textarea
              ref={textareaRef}
              id="guided-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={MAX_LENGTH}
              rows={3}
              className="w-full resize-none rounded-2xl border border-white/10 bg-zen-bg/70 px-4 py-4 text-base leading-relaxed text-foreground shadow-inner backdrop-blur-md transition-colors focus:border-amber-gold/40 focus:outline-none focus:ring-1 focus:ring-amber-gold/30"
              aria-describedby="question-hint"
            />
            <AnimatePresence mode="wait">
              {!question && (
                <motion.span
                  key={placeholderIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.45 }}
                  exit={{ opacity: 0 }}
                  transition={gentleEase}
                  className="pointer-events-none absolute left-4 top-4 right-4 text-base text-zen-muted"
                  aria-hidden
                >
                  {ROTATING_PLACEHOLDERS[placeholderIndex]}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <p id="question-hint" className="mt-2 text-xs text-zen-muted">
            {question.length}/{MAX_LENGTH}
            {question.length > 0 && question.length < MIN_LENGTH
              ? ` · ${MIN_LENGTH - question.length} more characters`
              : ""}
          </p>

          <div className="mt-6">
            <p className="text-[10px] font-medium uppercase tracking-widest text-zen-muted">
              Suggestions
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => applyPrompt(prompt)}
                  className="rounded-full border border-white/10 bg-zen-surface/40 px-3 py-2 text-left text-xs text-zen-muted transition-colors hover:border-amber-gold/30 hover:text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {category && category.prompts.length > 0 && (
            <GlassCard className="mt-4 p-4">
              <p className="text-[10px] uppercase tracking-widest text-amber-gold/80">
                For {category.label}
              </p>
              <ul className="mt-2 space-y-2">
                {category.prompts.map((prompt) => (
                  <li key={prompt}>
                    <button
                      type="button"
                      onClick={() => applyPrompt(prompt)}
                      className="w-full text-left text-sm text-zen-muted hover:text-foreground"
                    >
                      {prompt}
                    </button>
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPrompt(pickRandomPrompt())}
              className="text-xs text-amber-gold/90 hover:text-amber-gold"
            >
              ✦ Random inspiration
            </button>
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-10 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={onBack}
              className="min-h-[44px] text-sm text-zen-muted hover:text-amber-gold"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={!canContinue}
              className="auth-btn-primary min-h-[48px] px-10 text-sm disabled:opacity-40"
            >
              Consult the Oracle
            </button>
          </div>
        </form>
      </div>
    </GuidedShell>
  );
}
