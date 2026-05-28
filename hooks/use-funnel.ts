"use client";

import { useCallback, useRef } from "react";
import {
  ANALYTICS_FUNNELS,
  type AnalyticsFunnelId,
} from "@/lib/analytics/events";
import { useAnalytics } from "@/hooks/use-analytics";

type FunnelStepMap = {
  [ANALYTICS_FUNNELS.READING_CONVERSION]: {
    landing_view: void;
    start_reading: void;
    question_submitted: { category?: string; question_length?: number };
    reading_completed: { reading_id?: string; category?: string };
    reading_saved: { reading_id?: string };
    subscribe: { plan_type?: string };
  };
  [ANALYTICS_FUNNELS.SIGNUP_RETENTION]: {
    signup: void;
    first_reading: { reading_id?: string };
    second_reading: { reading_id?: string };
    followup_question: void;
    paid_conversion: { plan_type?: string };
  };
};

const FUNNEL_EVENT_MAP: Record<
  AnalyticsFunnelId,
  Record<string, string>
> = {
  [ANALYTICS_FUNNELS.READING_CONVERSION]: {
    landing_view: "page_viewed",
    start_reading: "onboarding_started",
    question_submitted: "question_submitted",
    reading_completed: "reading_completed",
    reading_saved: "reading_saved",
    subscribe: "subscription_started",
  },
  [ANALYTICS_FUNNELS.SIGNUP_RETENTION]: {
    signup: "user_signed_up",
    first_reading: "reading_completed",
    second_reading: "reading_completed",
    followup_question: "followup_question_asked",
    paid_conversion: "payment_completed",
  },
};

/**
 * Track ordered funnel steps with deduplication per session.
 */
export function useFunnel<F extends AnalyticsFunnelId>(funnelId: F) {
  const { track } = useAnalytics();
  const completedRef = useRef<Set<string>>(new Set());

  const trackStep = useCallback(
    <S extends keyof FunnelStepMap[F]>(
      step: S,
      properties?: FunnelStepMap[F][S],
    ) => {
      const key = `${funnelId}:${String(step)}`;
      if (completedRef.current.has(key)) return;
      completedRef.current.add(key);

      const event =
        FUNNEL_EVENT_MAP[funnelId][String(step)] ?? `${funnelId}_${String(step)}`;

      track(event, {
        funnel: funnelId,
        funnelStep: String(step),
        properties: properties as Record<string, string | number | boolean | undefined>,
      });
    },
    [funnelId, track],
  );

  return { trackStep };
}
