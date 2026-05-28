"use client";

import { AnimatePresence, motion } from "framer-motion";
import { OnboardingHero } from "@/components/guided-reading/onboarding-hero";
import { CategorySelector } from "@/components/guided-reading/category-selector";
import { GuidedQuestionInput } from "@/components/guided-reading/guided-question-input";
import { RitualTransition } from "@/components/guided-reading/ritual-transition";
import { ProgressiveReadingReveal } from "@/components/guided-reading/progressive-reading-reveal";
import { ShareStep } from "@/components/guided-reading/share-step";
import { InsufficientCreditsModal } from "@/components/credits/insufficient-credits-modal";
import { useGuidedReadingFlow } from "@/hooks/use-guided-reading-flow";

export function GuidedReadingFlow() {
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
          <OnboardingHero key="hero" onStart={() => setStep("category")} />
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
            onSubmit={submitQuestion}
            onBack={() => setStep("category")}
          />
        )}

        {step === "ritual" && (
          <RitualTransition
            key="ritual"
            question={question}
            fetchReading={fetchReading}
            onComplete={completeRitual}
            onError={handleRitualError}
          />
        )}

        {step === "reading" && result && (
          <ProgressiveReadingReveal
            key="reading"
            result={result}
            onShare={() => setStep("share")}
            onNewReading={resetFlow}
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
