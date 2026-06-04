import "server-only";

import { prisma } from "@/lib/prisma";

export type RateLimitResult =
  | { ok: true; remaining: number; resetAt: Date }
  | { ok: false; remaining: 0; resetAt: Date; retryAfterSec: number };

async function evaluateRateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const now = new Date();
  const safeKey = key.slice(0, 200);

  const bucket = await prisma.rateLimitBucket.findUnique({
    where: { key: safeKey },
  });

  if (!bucket || now >= bucket.resetAt) {
    const resetAt = new Date(now.getTime() + windowSec * 1000);
    return { ok: true, remaining: limit - 1, resetAt };
  }

  if (bucket.count >= limit) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((bucket.resetAt.getTime() - now.getTime()) / 1000),
    );
    return {
      ok: false,
      remaining: 0,
      resetAt: bucket.resetAt,
      retryAfterSec,
    };
  }

  return {
    ok: true,
    remaining: Math.max(0, limit - bucket.count - 1),
    resetAt: bucket.resetAt,
  };
}

/** Check limit without incrementing (use before expensive work). */
export async function peekRateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  return evaluateRateLimit(key, limit, windowSec);
}

/**
 * Fixed-window rate limit backed by PostgreSQL (works across serverless instances).
 * Increments the counter when within the window.
 */
export async function enforceRateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const peek = await evaluateRateLimit(key, limit, windowSec);
  if (!peek.ok) {
    return peek;
  }

  const now = new Date();
  const safeKey = key.slice(0, 200);

  const bucket = await prisma.rateLimitBucket.findUnique({
    where: { key: safeKey },
  });

  if (!bucket || now >= bucket.resetAt) {
    const resetAt = new Date(now.getTime() + windowSec * 1000);
    await prisma.rateLimitBucket.upsert({
      where: { key: safeKey },
      create: { key: safeKey, count: 1, resetAt },
      update: { count: 1, resetAt },
    });
    return { ok: true, remaining: limit - 1, resetAt };
  }

  const updated = await prisma.rateLimitBucket.update({
    where: { key: safeKey },
    data: { count: { increment: 1 } },
  });

  return {
    ok: true,
    remaining: Math.max(0, limit - updated.count),
    resetAt: updated.resetAt,
  };
}

/** Remove expired buckets (optional cron). */
export async function pruneRateLimitBuckets(): Promise<number> {
  const result = await prisma.rateLimitBucket.deleteMany({
    where: { resetAt: { lt: new Date() } },
  });
  return result.count;
}
