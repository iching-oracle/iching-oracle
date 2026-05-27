"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CastingCeremony } from "@/components/guided-reading/casting-ceremony";
import { HexagramReveal } from "@/components/guided-reading/hexagram-reveal";
import { QuestionGuide } from "@/components/guided-reading/question-guide";
import { RitualIntro } from "@/components/guided-reading/ritual-intro";
import { ShareStep } from "@/components/guided-reading/share-step";
import { StreamingReading } from "@/components/guided-reading/streaming-reading";
import { InsufficientCreditsModal } from "@/components/credits/insufficient-credits-modal";
import { useGuidedReadingFlow } from "@/hooks/use-guided-reading-flow";

export function GuidedReadingFlow() {
  const {
    step,
    setStep,
    question,
    result,
    error,
    creditsModal,
    setCreditsModal,
    fetchReading,
    submitQuestion,
    completeCast,
    handleCastError,
  } = useGuidedReadingFlow();

  return (
    <div className="relative min-h-[calc(100dvh-4.5rem)] bg-zen-bg">
      {error && step === "question" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 mx-auto max-w-lg px-4 pt-4"
          role="alert"
        >
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <RitualIntro key="welcome" onBegin={() => setStep("question")} />
        )}

        {step === "question" && (
          <QuestionGuide
            key="question"
            initialQuestion={question}
            onBack={() => setStep("welcome")}
            onSubmit={submitQuestion}
          />
        )}

        {step === "casting" && (
          <CastingCeremony
            key="casting"
            question={question}
            fetchReading={fetchReading}
            onComplete={completeCast}
            onError={handleCastError}
          />
        )}

        {step === "reveal" && result && (
          <HexagramReveal
            key="reveal"
            result={result}
            onContinue={() => setStep("reading")}
          />
        )}

        {step === "reading" && result && (
          <StreamingReading
            key="reading"
            result={result}
            onShare={() => setStep("share")}
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
