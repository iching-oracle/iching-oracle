export type CookieCategory = "essential" | "analytics" | "marketing";

export type ConsentState = {
  version: number;
  essential: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export type SupportCategory =
  | "general"
  | "billing"
  | "refund"
  | "technical"
  | "feedback"
  | "privacy";

export type SystemEventLevel = "info" | "warn" | "error";
