export type SubscriptionStatus =
  | "free"
  | "premium"
  | "canceled"
  | "past_due";

export type UserSubscription = {
  status: SubscriptionStatus;
  isPremium: boolean;
  currentPeriodEnd: Date | null;
  premiumUntil: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
};

export type UsageLimits = {
  dailyReadingLimit: number;
  dailyReadingsUsed: number;
  canCreateReading: boolean;
  historyAccessLimited: boolean;
  maxHistoryItems: number | null;
};

export const SUBSCRIPTION_ERROR_CODES = {
  DAILY_LIMIT: "DAILY_READING_LIMIT",
  PREMIUM_REQUIRED: "PREMIUM_REQUIRED",
} as const;
