import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import {
  enforceRateLimit as enforcePrismaRateLimit,
  type RateLimitResult as PrismaRateLimitResult,
} from "@/lib/rate-limit/enforce";
import { getRedis } from "@/lib/rate-limit/redis-client";
import {
  getAiDailyLimit,
  getAiHourlyLimit,
  getApiPerMinuteLimit,
  getReadingCooldownSec,
  presetFromCount,
  tierBypassesLimits,
} from "@/lib/rate-limit/plan-limits";
import { getClientIp } from "@/lib/rate-limit/client-ip";
import {
  isRateLimitEnforced,
  type RateLimitTier,
} from "@/lib/protection/config";
import { prisma } from "@/lib/prisma";
import { resolvePlanType } from "@/lib/credits/plan";
import { isPremiumUser } from "@/lib/subscription";

export type RateLimitResult =
  | {
      ok: true;
      remaining: number;
      limit: number;
      resetAt: Date;
      retryAfterSec?: undefined;
    }
  | {
      ok: false;
      remaining: 0;
      limit: number;
      resetAt: Date;
      retryAfterSec: number;
    };

const OK_UNLIMITED: RateLimitResult = {
  ok: true,
  remaining: 999,
  limit: 999,
  resetAt: new Date(Date.now() + 3600_000),
};

const limiterCache = new Map<string, Ratelimit>();

function toResult(
  limit: number,
  success: boolean,
  remaining: number,
  resetMs: number,
): RateLimitResult {
  const resetAt = new Date(resetMs);
  if (success) {
    return {
      ok: true,
      remaining: Math.max(0, remaining),
      limit,
      resetAt,
    };
  }
  const retryAfterSec = Math.max(
    1,
    Math.ceil((resetMs - Date.now()) / 1000),
  );
  return {
    ok: false,
    remaining: 0,
    limit,
    resetAt,
    retryAfterSec,
  };
}

function prismaToResult(
  limit: number,
  r: PrismaRateLimitResult,
): RateLimitResult {
  if (r.ok) {
    return {
      ok: true,
      remaining: r.remaining,
      limit,
      resetAt: r.resetAt,
    };
  }
  return {
    ok: false,
    remaining: 0,
    limit,
    resetAt: r.resetAt,
    retryAfterSec: r.retryAfterSec,
  };
}

function getLimiter(limit: number, windowSec: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  const key = `${limit}:${windowSec}`;
  let limiter = limiterCache.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(limit, `${windowSec} s`),
      prefix: "iching-rl",
      analytics: true,
    });
    limiterCache.set(key, limiter);
  }
  return limiter;
}

/** Low-latency rate limit check + consume. Upstash first, Prisma fallback. */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  if (!isRateLimitEnforced()) return OK_UNLIMITED;

  const safeKey = key.slice(0, 200);
  const limiter = getLimiter(limit, windowSec);

  if (limiter) {
    const { success, remaining, reset } = await limiter.limit(safeKey);
    return toResult(limit, success, remaining, reset);
  }

  return prismaToResult(
    limit,
    await enforcePrismaRateLimit(safeKey, limit, windowSec),
  );
}

export async function peekRateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  if (!isRateLimitEnforced()) return OK_UNLIMITED;
  // Upstash Ratelimit has no peek — consume is the source of truth for production.
  // For Prisma path, use enforce module peek via presets (legacy).
  return consumeRateLimit(key, limit, windowSec);
}

export function rateLimitKeyIp(request: Request, scope: string): string {
  return `ip:${scope}:${getClientIp(request)}`;
}

export function rateLimitKeyUser(userId: string, scope: string): string {
  return `user:${scope}:${userId}`;
}

export async function resolveUserTier(params: {
  userId?: string | null;
  role?: string | null;
}): Promise<RateLimitTier> {
  if (params.role === "ADMIN") return "admin";
  if (!params.userId) return "guest";

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      role: true,
      planType: true,
      premiumUntil: true,
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
    },
  });

  if (!user) return "guest";
  if (user.role === "ADMIN") return "admin";

  const plan = resolvePlanType({
    planType: user.planType,
    credits: 0,
    monthlyCredits: 0,
    lifetimeCreditsUsed: 0,
    lastCreditRefillAt: null,
    lastCreditRefillPeriodEnd: null,
    premiumUntil: user.premiumUntil,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
  });

  if (plan === "PREMIUM" || isPremiumUser(user)) return "premium";
  return "free";
}

export async function enforceTierAiLimits(params: {
  userId: string;
  role?: string | null;
}): Promise<RateLimitResult> {
  const tier = await resolveUserTier(params);
  if (tierBypassesLimits(tier)) return OK_UNLIMITED;

  const hourly = await consumeRateLimit(
    rateLimitKeyUser(params.userId, "ai-hour"),
    getAiHourlyLimit(tier),
    3600,
  );
  if (!hourly.ok) return hourly;

  return consumeRateLimit(
    rateLimitKeyUser(params.userId, "ai-day"),
    getAiDailyLimit(tier),
    86_400,
  );
}

export async function enforceReadingCooldown(params: {
  userId: string;
  role?: string | null;
}): Promise<RateLimitResult> {
  const tier = await resolveUserTier(params);
  const cooldown = getReadingCooldownSec(tier);
  if (cooldown <= 0) return OK_UNLIMITED;

  return consumeRateLimit(
    rateLimitKeyUser(params.userId, "reading-cooldown"),
    1,
    cooldown,
  );
}

export async function enforceApiBurst(params: {
  request: Request;
  userId?: string | null;
  role?: string | null;
  scope: string;
}): Promise<RateLimitResult> {
  const tier = await resolveUserTier({
    userId: params.userId,
    role: params.role,
  });
  if (tierBypassesLimits(tier)) return OK_UNLIMITED;

  const preset = presetFromCount(
    getApiPerMinuteLimit(tier),
    60,
  );

  const key = params.userId
    ? rateLimitKeyUser(params.userId, `api:${params.scope}`)
    : rateLimitKeyIp(params.request, `api:${params.scope}`);

  return consumeRateLimit(key, preset.limit, preset.windowSec);
}

export async function rateLimitByIp(
  request: Request,
  scope: string,
  preset: { limit: number; windowSec: number },
): Promise<RateLimitResult> {
  return consumeRateLimit(
    rateLimitKeyIp(request, scope),
    preset.limit,
    preset.windowSec,
  );
}

export async function rateLimitByUser(
  userId: string,
  scope: string,
  preset: { limit: number; windowSec: number },
): Promise<RateLimitResult> {
  return consumeRateLimit(
    rateLimitKeyUser(userId, scope),
    preset.limit,
    preset.windowSec,
  );
}

