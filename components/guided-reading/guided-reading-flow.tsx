"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OnboardingHero } from "@/components/guided-reading/onboarding-hero";
import { CategorySelector } from "@/components/guided-reading/category-selector";
import { GuidedQuestionInput } from "@/components/guided-reading/guided-question-input";
import { RitualTransition } from "@/components/guided-reading/ritual-transition";
import { ProgressiveReadingReveal } from "@/components/guided-reading/progressive-reading-reveal";
import { ShareStep } from "@/components/guided-reading/share-step";
import { InsufficientCreditsModal } from "@/components/credits/insufficient-credits-modal";
import { useGuidedReadingFlow } from "@/hooks/use-guided-reading-flow";
import { useAnalytics } from "@/hooks/use-analytics";
import { useFunnel } from "@/hooks/use-funnel";
import { ANALYTICS_EVENTS, ANALYTICS_FUNNELS } from "@/lib/analytics/events";

export function GuidedReadingFlow() {
  const { track } = useAnalytics();
  const readingFunnel = useFunnel(ANALYTICS_FUNNELS.READING_CONVERSION);
  const startedRef = useRef(false);

  const {
    step,
    setStep,
    categoryId,
    question,
    result,
    error,
    creditsModal,
    setCreditsModal,
    fetchReading,
    selectCategory,
    continueFromCategory,
    submitQuestion,
    completeRitual,
    handleRitualError,
    resetFlow,
  } = useGuidedReadingFlow();

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    track(ANALYTICS_EVENTS.ONBOARDING_STARTED);
    readingFunnel.trackStep("start_reading");
  }, [track, readingFunnel]);

  useEffect(() => {
    if (step === "category" && categoryId) {
      track(ANALYTICS_EVENTS.CATEGORY_SELECTED, {
        properties: { category: categoryId },
      });
    }
  }, [step, categoryId, track]);

  useEffect(() => {
    if (step === "question") {
      track(ANALYTICS_EVENTS.QUESTION_STARTED);
    }
  }, [step, track]);

  return (
    <div className="relative min-h-[calc(100dvh-4.5rem)] bg-zen-bg">
      {error && (step === "question" || step === "category") && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-50 mx-auto max-w-lg px-4 pt-4"
          role="alert"
        >
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === "hero" && (
          <OnboardingHero
            key="hero"
            onStart={() => {
              track(ANALYTICS_EVENTS.CTA_CLICKED, {
                properties: { cta_id: "start_reading_hero" },
              });
              setStep("category");
            }}
          />
        )}

        {step === "category" && (
          <CategorySelector
            key="category"
            selectedId={categoryId}
            onSelect={selectCategory}
            onContinue={continueFromCategory}
            onBack={() => setStep("hero")}
          />
        )}

        {step === "question" && categoryId && (
          <GuidedQuestionInput
            key="question"
            categoryId={categoryId}
            initialQuestion={question}
            onSubmit={(q) => {
              track(ANALYTICS_EVENTS.QUESTION_SUBMITTED, {
                properties: {
                  category: categoryId ?? undefined,
                  question_length: q.trim().length,
                },
              });
              readingFunnel.trackStep("question_submitted", {
                category: categoryId ?? undefined,
                question_length: q.trim().length,
              });
              submitQuestion(q);
            }}
            onBack={() => setStep("category")}
          />
        )}

        {step === "ritual" && (
          <RitualTransition
            key="ritual"
            question={question}
            fetchReading={fetchReading}
            onComplete={(r) => {
              track(ANALYTICS_EVENTS.READING_STARTED, {
                properties: { category: r.category, hexagram: r.hexagram },
              });
              completeRitual(r);
            }}
            onError={handleRitualError}
          />
        )}

        {step === "reading" && result && (
          <ProgressiveReadingReveal
            key="reading"
            result={result}
            onShare={() => {
              track(ANALYTICS_EVENTS.READING_SHARED, {
                properties: { reading_id: result.readingId },
              });
              setStep("share");
            }}
            onNewReading={() => {
              track(ANALYTICS_EVENTS.NEW_READING_STARTED);
              resetFlow();
            }}
            onReadingComplete={() => {
              track(ANALYTICS_EVENTS.READING_COMPLETED, {
                properties: {
                  reading_id: result.readingId,
                  category: result.category,
                },
              });
              track(ANALYTICS_EVENTS.ONBOARDING_COMPLETED);
              readingFunnel.trackStep("reading_completed", {
                reading_id: result.readingId,
                category: result.category,
              });
            }}
          />
        )}

        {step === "share" && result && (
          <ShareStep
            key="share"
            result={result}
            onDone={() => {
              window.location.href = "/dashboard";
            }}
          />
        )}
      </AnimatePresence>

      <InsufficientCreditsModal
        open={creditsModal}
        onClose={() => setCreditsModal(false)}
        message="You need more credits to cast this reading."
      />
    </div>
  );
}
