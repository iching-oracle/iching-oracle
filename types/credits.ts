export type PlanType = "FREE" | "PREMIUM";

export type CreditFeatureType =
  | "basic_reading"
  | "deep_interpretation"
  | "pattern_insight"
  | "oracle_chat"
  | "followup_chat"
  | "memory_extract";

export type CreditTransactionType = "ADD" | "SPEND" | "REFUND";

export type CreditBalanceDTO = {
  planType: PlanType;
  credits: number;
  /** @deprecated use monthlyCreditQuota */
  monthlyCredits: number;
  monthlyCreditQuota: number;
  lifetimeCreditsUsed: number;
  nextRefillAt: string | null;
  creditsResetAt: string | null;
  lastCreditRefillAt: string | null;
  lastCreditRefillPeriodEnd: string | null;
  isPremium: boolean;
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
  lowCreditWarning: boolean;
};

export type CreditUsageRow = {
  id: string;
  featureType: CreditFeatureType;
  creditsUsed: number;
  estimatedTokenUsage: number | null;
  createdAt: string;
};

export type CreditTransactionRow = {
  id: string;
  type: CreditTransactionType;
  amount: number;
  reason: string;
  createdAt: string;
};

export const CREDIT_ERROR_CODES = {
  INSUFFICIENT: "INSUFFICIENT_CREDITS",
  PREMIUM_REQUIRED: "PREMIUM_REQUIRED",
  RATE_LIMIT: "CREDIT_RATE_LIMIT",
} as const;
