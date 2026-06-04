import { PREMIUM_CURRENCY, PREMIUM_PRICE_CENTS } from "@/lib/pricing/constants";

export const FREE_PLAN_FEATURES = [
  "3 oracle readings per day",
  "Core hexagram & daily oracle",
  "30-day reading history",
  "Guided question flow",
] as const;

export const PREMIUM_PLAN_FEATURES = [
  "Unlimited readings",
  "Full 7-section AI interpretation",
  "Changing lines & transformed hexagram",
  "Oracle chat & pattern insights",
  "Premium share themes & HD export",
  "Priority AI depth",
] as const;

export function formatPremiumPrice(): string {
  const amount = PREMIUM_PRICE_CENTS / 100;
  const symbol = PREMIUM_CURRENCY.toUpperCase() === "EUR" ? "€" : "$";
  return `${symbol}${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`;
}
