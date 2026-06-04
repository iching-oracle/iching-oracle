import "server-only";

import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import type { AnalyticsProperties } from "@/lib/analytics/properties";
import { trackServerEvent } from "@/lib/analytics/server";

export type SubscriptionAnalyticsEvent =
  | "checkout_opened"
  | "upgrade_clicked"
  | "subscription_started"
  | "subscription_canceled"
  | "payment_failed";

const EVENT_MAP: Record<SubscriptionAnalyticsEvent, string> = {
  checkout_opened: ANALYTICS_EVENTS.CHECKOUT_INITIATED,
  upgrade_clicked: ANALYTICS_EVENTS.UPGRADE_CLICKED,
  subscription_started: ANALYTICS_EVENTS.SUBSCRIPTION_STARTED,
  subscription_canceled: ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED,
  payment_failed: ANALYTICS_EVENTS.PAYMENT_FAILED,
};

type EventPayload = AnalyticsProperties & { userId?: string };

/** Server-side subscription analytics (Stripe webhooks, API routes). */
export async function trackSubscriptionEvent(
  event: SubscriptionAnalyticsEvent,
  payload?: EventPayload,
): Promise<void> {
  const { userId, ...properties } = payload ?? {};
  await trackServerEvent(EVENT_MAP[event], {
    userId,
    properties: {
      ...properties,
      cta_id: event === "upgrade_clicked" ? "upgrade" : undefined,
      source: "stripe",
      plan_type: properties.plan_type ?? "PREMIUM",
      price_cents: properties.price_cents ?? 999,
      currency: properties.currency ?? "eur",
    },
  });
}
