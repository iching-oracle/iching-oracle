"use client";

import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import type { AnalyticsProperties } from "@/lib/analytics/properties";
import { captureClientEvent } from "@/lib/analytics/client";
import {
  CONSENT_STORAGE_KEY,
  hasAnalyticsConsent,
  parseConsent,
} from "@/lib/compliance/consent";

export type SubscriptionAnalyticsEvent =
  | "checkout_opened"
  | "upgrade_clicked"
  | "subscription_started"
  | "subscription_canceled"
  | "payment_failed";

const EVENT_MAP: Record<SubscriptionAnalyticsEvent, string> = {
  checkout_opened: ANALYTICS_EVENTS.CHECKOUT_INITIATED,
  upgrade_clicked: ANALYTICS_EVENTS.CTA_CLICKED,
  subscription_started: ANALYTICS_EVENTS.SUBSCRIPTION_STARTED,
  subscription_canceled: ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED,
  payment_failed: ANALYTICS_EVENTS.PAYMENT_FAILED,
};

type EventPayload = AnalyticsProperties & { userId?: string };

/** Client-side subscription analytics (requires consent via captureClientEvent caller). */
export function trackSubscriptionEventClient(
  event: SubscriptionAnalyticsEvent,
  payload?: EventPayload,
): void {
  const consent = parseConsent(
    typeof window !== "undefined"
      ? localStorage.getItem(CONSENT_STORAGE_KEY)
      : null,
  );
  if (!hasAnalyticsConsent(consent)) return;

  const { userId, ...properties } = payload ?? {};
  captureClientEvent(EVENT_MAP[event], {
    userId,
    properties: {
      ...properties,
      cta_id: event === "upgrade_clicked" ? "upgrade" : undefined,
      button_id: event,
    },
  });
}
