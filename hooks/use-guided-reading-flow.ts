"use client";

import { useCallback, useState } from "react";
import type { QuestionCategory } from "@/lib/guided-reading/categories";
import type { GuidedReadingResult, GuidedStep } from "@/types/guided-reading";
import { CREDIT_ERROR_CODES } from "@/types/credits";

export function useGuidedReadingFlow() {
  const [step, setStep] = useState<GuidedStep>("hero");
  const [categoryId, setCategoryId] = useState<QuestionCategory["id"] | null>(
    null,
  );
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<GuidedReadingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creditsModal, setCreditsModal] = useState(false);
  const [creditsModalMessage, setCreditsModalMessage] = useState<string>();
  const [creditsModalCode, setCreditsModalCode] = useState<string>();
  const [retryAfterSec, setRetryAfterSec] = useState<number>();

  const fetchReading = useCallback(async (): Promise<GuidedReadingResult> => {
    const res = await fetch("/api/readings/guided", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = (await res.json()) as GuidedReadingResult & {
      error?: string;
      code?: string;
      retryAfterSec?: number;
      remaining?: number;
      limit?: number;
    };

    if (!res.ok) {
      const isLimited =
        res.status === 429 ||
        data.code === CREDIT_ERROR_CODES.RATE_LIMIT ||
        data.code === "RATE_LIMITED";
      if (
        data.code === CREDIT_ERROR_CODES.INSUFFICIENT ||
        isLimited
      ) {
        setCreditsModalMessage(data.error);
        setCreditsModalCode(
          isLimited ? CREDIT_ERROR_CODES.RATE_LIMIT : data.code,
        );
        setRetryAfterSec(data.retryAfterSec);
        setCreditsModal(true);
      }
      throw new Error(data.error ?? "Could not complete reading");
    }

    return data;
  }, [question]);

  const selectCategory = useCallback((id: QuestionCategory["id"]) => {
    setCategoryId(id);
  }, []);

  const continueFromCategory = useCallback(() => {
    if (!categoryId) return;
    setStep("question");
  }, [categoryId]);

  const submitQuestion = useCallback((q: string) => {
    setError(null);
    setQuestion(q);
    setStep("ritual");
  }, []);

  const completeRitual = useCallback((r: GuidedReadingResult) => {
    setResult(r);
    setStep("reading");
  }, []);

  const handleRitualError = useCallback((message: string) => {
    setError(message);
    setStep("question");
  }, []);

  const resetFlow = useCallback(() => {
    setResult(null);
    setQuestion("");
    setCategoryId(null);
    setError(null);
    setStep("hero");
  }, []);

  return {
    step,
    setStep,
    categoryId,
    question,
    result,
    error,
    creditsModal,
    setCreditsModal,
    creditsModalMessage,
    creditsModalCode,
    retryAfterSec,
    fetchReading,
    selectCategory,
    continueFromCategory,
    submitQuestion,
    completeRitual,
    handleRitualError,
    resetFlow,
  };
}
