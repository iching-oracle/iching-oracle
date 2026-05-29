/**
 * Central analytics event catalog.
 * Use these constants everywhere — never ad-hoc event strings.
 */

export const ANALYTICS_EVENTS = {
  // Auth
  USER_SIGNED_UP: "user_signed_up",
  USER_LOGGED_IN: "user_logged_in",
  USER_LOGGED_OUT: "user_logged_out",

  // Onboarding / guided flow
  ONBOARDING_STARTED: "onboarding_started",
  CATEGORY_SELECTED: "category_selected",
  QUESTION_STARTED: "question_started",
  QUESTION_SUBMITTED: "question_submitted",
  ONBOARDING_COMPLETED: "onboarding_completed",

  // Readings
  READING_STARTED: "reading_started",
  READING_GENERATED: "reading_generated",
  READING_COMPLETED: "reading_completed",
  READING_SAVED: "reading_saved",
  READING_SHARED: "reading_shared",
  FOLLOWUP_QUESTION_ASKED: "followup_question_asked",
  NEW_READING_STARTED: "new_reading_started",

  // Engagement
  SESSION_STARTED: "session_started",
  PAGE_VIEWED: "page_viewed",
  CTA_CLICKED: "cta_clicked",
  BUTTON_CLICKED: "button_clicked",

  // Subscription
  PAYWALL_VIEWED: "paywall_viewed",
  SUBSCRIPTION_STARTED: "subscription_started",
  CHECKOUT_INITIATED: "checkout_initiated",
  PAYMENT_COMPLETED: "payment_completed",
  SUBSCRIPTION_CANCELLED: "subscription_cancelled",

  // Email lifecycle
  EMAIL_SENT: "email_sent",
  EMAIL_OPENED: "email_opened",
  EMAIL_CLICKED: "email_clicked",
  REENGAGEMENT_SUCCESS: "reengagement_success",
  STREAK_RESTORED: "streak_restored",
  READING_FEEDBACK: "reading_feedback",

  // Errors
  AI_GENERATION_FAILED: "ai_generation_failed",
  PAYMENT_FAILED: "payment_failed",
  API_ERROR: "api_error",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** Funnel identifiers for cohort analysis in admin. */
export const ANALYTICS_FUNNELS = {
  READING_CONVERSION: "reading_conversion",
  SIGNUP_RETENTION: "signup_retention",
} as const;

export type AnalyticsFunnelId =
  (typeof ANALYTICS_FUNNELS)[keyof typeof ANALYTICS_FUNNELS];

/** Steps within each funnel (order matters for drop-off). */
export const FUNNEL_STEPS = {
  [ANALYTICS_FUNNELS.READING_CONVERSION]: [
    "landing_view",
    "start_reading",
    "question_submitted",
    "reading_completed",
    "reading_saved",
    "subscribe",
  ],
  [ANALYTICS_FUNNELS.SIGNUP_RETENTION]: [
    "signup",
    "first_reading",
    "second_reading",
    "followup_question",
    "paid_conversion",
  ],
} as const;
