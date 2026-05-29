import "server-only";

import { USER_MESSAGES } from "@/lib/errors/messages";
import { apiRateLimited } from "@/lib/errors/api";
import { getClientIp } from "@/lib/rate-limit/client-ip";
import { enforceRateLimit } from "@/lib/rate-limit/enforce";

export const RATE_LIMITS = {
  /** Registration attempts per IP per hour */
  register: { limit: 5, windowSec: 3600 },
  /** Waitlist signups per IP per hour */
  waitlist: { limit: 8, windowSec: 3600 },
  /** Support tickets per IP per hour */
  support: { limit: 5, windowSec: 3600 },
  /** Client error reports per IP per hour */
  clientError: { limit: 30, windowSec: 3600 },
  /** Share enable per user per hour */
  share: { limit: 20, windowSec: 3600 },
  /** Extra reading guard per user per day (on top of credits) */
  readingDaily: { limit: 40, windowSec: 86400 },
  /** Auth attempts per IP per 15 min */
  auth: { limit: 20, windowSec: 900 },
} as const;

export async function rateLimitByIp(
  request: Request,
  scope: string,
  preset: { limit: number; windowSec: number },
) {
  const ip = getClientIp(request);
  return enforceRateLimit(`ip:${scope}:${ip}`, preset.limit, preset.windowSec);
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
