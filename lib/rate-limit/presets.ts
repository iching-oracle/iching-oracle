import "server-only";

import { USER_MESSAGES } from "@/lib/errors/messages";
import { apiRateLimited } from "@/lib/errors/api";
import { getClientIp } from "@/lib/rate-limit/client-ip";
import {
  enforceRateLimit,
  peekRateLimit,
  type RateLimitResult,
} from "@/lib/rate-limit/enforce";

export const RATE_LIMITS = {
  /** Registration attempts per IP per hour */
  register: { limit: 5, windowSec: 3600 },
  /** Waitlist signups per IP per hour */
  waitlist: { limit: 8, windowSec: 3600 },
  /** Support tickets per IP per hour */
  support: { limit: 5, windowSec: 3600 },
  /** Public contact form per IP per hour */
  contact: { limit: 5, windowSec: 3600 },
  /** Client error reports per IP per hour */
  clientError: { limit: 30, windowSec: 3600 },
  /** Share enable per user per hour */
  share: { limit: 20, windowSec: 3600 },
  /** Extra reading guard per user per day (on top of credits) */
  readingDaily: { limit: 40, windowSec: 86400 },
  /** Auth attempts per IP per 15 min */
  auth: { limit: 20, windowSec: 900 },
  /** Password reset requests per IP per hour */
  forgotPassword: { limit: 5, windowSec: 3600 },
  /** Password reset submissions per IP per 15 min */
  resetPassword: { limit: 10, windowSec: 900 },
} as const;

const RATE_LIMIT_OK: RateLimitResult = {
  ok: true,
  remaining: 999,
  resetAt: new Date(Date.now() + 3600_000),
};

/** Skip IP limits in local dev unless ENFORCE_RATE_LIMIT=true. */
export function isRateLimitEnforced(): boolean {
  if (process.env.ENFORCE_RATE_LIMIT === "true") return true;
  return process.env.NODE_ENV === "production";
}

function rateLimitKey(request: Request, scope: string): string {
  const ip = getClientIp(request);
  return `ip:${scope}:${ip}`;
}

export async function peekRateLimitByIp(
  request: Request,
  scope: string,
  preset: { limit: number; windowSec: number },
): Promise<RateLimitResult> {
  if (!isRateLimitEnforced()) return RATE_LIMIT_OK;
  return peekRateLimit(
    rateLimitKey(request, scope),
    preset.limit,
    preset.windowSec,
  );
}

export async function consumeRateLimitByIp(
  request: Request,
  scope: string,
  preset: { limit: number; windowSec: number },
): Promise<RateLimitResult> {
  if (!isRateLimitEnforced()) return RATE_LIMIT_OK;
  return enforceRateLimit(
    rateLimitKey(request, scope),
    preset.limit,
    preset.windowSec,
  );
}

export async function rateLimitByIp(
  request: Request,
  scope: string,
  preset: { limit: number; windowSec: number },
) {
  return consumeRateLimitByIp(request, scope, preset);
}

export async function rateLimitByUser(
  userId: string,
  scope: string,
  preset: { limit: number; windowSec: number },
) {
  return enforceRateLimit(`user:${scope}:${userId}`, preset.limit, preset.windowSec);
}

export function rateLimitResponse(
  result: Extract<Awaited<ReturnType<typeof enforceRateLimit>>, { ok: false }>,
  message: string = USER_MESSAGES.rateLimitedShort,
) {
  return apiRateLimited(message, result.retryAfterSec);
}
