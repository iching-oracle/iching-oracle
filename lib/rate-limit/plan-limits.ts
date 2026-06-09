import type { RateLimitTier } from "@/lib/protection/config";
import { TIER_LIMITS } from "@/lib/protection/config";

export type PlanLimitPreset = {
  limit: number;
  windowSec: number;
};

export function tierBypassesLimits(tier: RateLimitTier): boolean {
  return tier === "admin";
}

export function getAiHourlyLimit(tier: RateLimitTier): number {
  if (tier === "admin") return 10_000;
  if (tier === "premium") return TIER_LIMITS.premium.aiPerHour;
  if (tier === "free") return TIER_LIMITS.free.aiPerHour;
  return TIER_LIMITS.guest.aiPerHour;
}

export function getAiDailyLimit(tier: RateLimitTier): number {
  if (tier === "admin") return 100_000;
  if (tier === "premium") return TIER_LIMITS.premium.aiPerDay;
  if (tier === "free") return TIER_LIMITS.free.aiPerDay;
  return TIER_LIMITS.guest.aiPerDay;
}

export function getReadingCooldownSec(tier: RateLimitTier): number {
  if (tier === "admin") return 0;
  if (tier === "premium") return TIER_LIMITS.premium.readingCooldownSec;
  if (tier === "free") return TIER_LIMITS.free.readingCooldownSec;
  return TIER_LIMITS.guest.readingCooldownSec;
}

export function getApiPerMinuteLimit(tier: RateLimitTier): number {
  if (tier === "admin") return 600;
  if (tier === "premium") return TIER_LIMITS.premium.apiPerMinute;
  if (tier === "free") return TIER_LIMITS.free.apiPerMinute;
  return TIER_LIMITS.guest.apiPerMinute;
}

export function presetFromCount(
  limit: number,
  windowSec: number,
): PlanLimitPreset {
  return { limit, windowSec };
}
