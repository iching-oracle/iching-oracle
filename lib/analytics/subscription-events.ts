export type SubscriptionAnalyticsEvent =
  | "checkout_opened"
  | "upgrade_clicked"
  | "subscription_started"
  | "subscription_canceled"
  | "payment_failed";

type EventPayload = Record<string, string | number | boolean | undefined>;

/**
 * Analytics-ready hook — wire to PostHog, GA, etc. in one place later.
 */
export function trackSubscriptionEvent(
  event: SubscriptionAnalyticsEvent,
  payload?: EventPayload,
): void {
  if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", event, payload ?? {});
  }
}
