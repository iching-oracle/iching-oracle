"use client";

import { useCallback, useState } from "react";
import type { GuidedReadingResult, GuidedStep } from "@/types/guided-reading";
import { CREDIT_ERROR_CODES } from "@/types/credits";

export function useGuidedReadingFlow() {
  const [step, setStep] = useState<GuidedStep>("welcome");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<GuidedReadingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creditsModal, setCreditsModal] = useState(false);

  const fetchReading = useCallback(async (): Promise<GuidedReadingResult> => {
    const res = await fetch("/api/readings/guided", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = (await res.json()) as GuidedReadingResult & {
      error?: string;
      code?: string;
    };

    if (!res.ok) {
      if (data.code === CREDIT_ERROR_CODES.INSUFFICIENT) {
        setCreditsModal(true);
      }
      throw new Error(data.error ?? "Could not complete reading");
    }

    return data;
  }, [question]);

  const submitQuestion = useCallback((q: string) => {
    setError(null);
    setQuestion(q);
    setStep("casting");
  }, []);

  const completeCast = useCallback((r: GuidedReadingResult) => {
    setResult(r);
    setStep("reveal");
  }, []);

  const handleCastError = useCallback((message: string) => {
    setError(message);
    setStep("question");
  }, []);

  return {
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
  };
}
