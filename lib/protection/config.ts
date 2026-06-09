import "server-only";

/** Central protection & rate-limit configuration (env-driven). */

export type RateLimitTier = "guest" | "free" | "premium" | "admin";

function envInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function envFloat(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function isRateLimitEnforced(): boolean {
  if (process.env.ENFORCE_RATE_LIMIT === "true") return true;
  return process.env.NODE_ENV === "production";
}

export function isMaintenanceMode(): boolean {
  return process.env.MAINTENANCE_MODE === "true";
}

export function isAiDisabled(): boolean {
  return (
    process.env.AI_DISABLED === "true" ||
    process.env.EMERGENCY_AI_KILL_SWITCH === "true"
  );
}

export function hasUpstashRedis(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

/** USD per 1K tokens (blended input/output estimate). */
export function getTokenCostPer1k(): number {
  return envFloat("AI_COST_PER_1K_TOKENS_USD", 0.002);
}

export const PROTECTION = {
  /** Global daily token cap across all users (0 = disabled). */
  globalDailyTokenCap: envInt("AI_GLOBAL_DAILY_TOKEN_CAP", 0),
  /** Global hourly AI generation cap (0 = disabled). */
  globalHourlyGenerationCap: envInt("AI_GLOBAL_HOURLY_GENERATION_CAP", 0),
  /** Max AI HTTP retries (fetchAiCompletion). */
  aiMaxRetries: envInt("AI_MAX_RETRIES", 2),
  /** Default AI request timeout ms. */
  aiTimeoutMs: envInt("AI_REQUEST_TIMEOUT_MS", 90_000),
  /** Failed requests before temporary IP block. */
  abuseFailThreshold: envInt("ABUSE_FAIL_THRESHOLD", 25),
  /** IP block duration seconds. */
  abuseBlockSec: envInt("ABUSE_BLOCK_SEC", 900),
  /** Rapid requests per minute before bot flag. */
  abuseBurstPerMinute: envInt("ABUSE_BURST_PER_MINUTE", 120),
} as const;

export const TIER_LIMITS = {
  guest: {
    aiPerHour: envInt("RATE_GUEST_AI_PER_HOUR", 5),
    aiPerDay: envInt("RATE_GUEST_AI_PER_DAY", 10),
    readingCooldownSec: envInt("RATE_GUEST_READING_COOLDOWN_SEC", 120),
    apiPerMinute: envInt("RATE_GUEST_API_PER_MINUTE", 30),
  },
  free: {
    aiPerHour: envInt("RATE_FREE_AI_PER_HOUR", 20),
    aiPerDay: envInt("RATE_FREE_AI_PER_DAY", 50),
    readingCooldownSec: envInt("RATE_FREE_READING_COOLDOWN_SEC", 45),
    apiPerMinute: envInt("RATE_FREE_API_PER_MINUTE", 60),
  },
  premium: {
    aiPerHour: envInt("RATE_PREMIUM_AI_PER_HOUR", 80),
    aiPerDay: envInt("RATE_PREMIUM_AI_PER_DAY", 300),
    readingCooldownSec: envInt("RATE_PREMIUM_READING_COOLDOWN_SEC", 15),
    apiPerMinute: envInt("RATE_PREMIUM_API_PER_MINUTE", 120),
  },
} as const;
