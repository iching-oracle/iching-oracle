import type { AnalyticsFunnelId } from "@/lib/analytics/events";

/** Privacy-safe analytics properties (never include question text or PII). */
export type AnalyticsProperties = {
  // Reading
  category?: string;
  question_length?: number;
  reading_length?: number;
  changing_lines_count?: number;
  response_time_ms?: number;
  hexagram?: number;
  reading_id?: string;
  is_premium?: boolean;

  // Subscription
  plan_type?: string;
  price_cents?: number;
  currency?: string;
  referral_source?: string;

  // Engagement
  page_path?: string;
  page_title?: string;
  device_type?: "mobile" | "tablet" | "desktop";
  country?: string;
  traffic_source?: string;
  cta_id?: string;
  button_id?: string;
  funnel_step?: string;

  // Errors
  error_code?: string;
  error_category?: string;
  endpoint?: string;
  status_code?: number;

  // Misc
  source?: string;
  feature?: string;
  [key: string]: string | number | boolean | undefined;
};

export type TrackEventPayload = {
  event: string;
  properties?: AnalyticsProperties;
  funnel?: AnalyticsFunnelId;
  funnelStep?: string;
  sessionId?: string;
  distinctId?: string;
};
