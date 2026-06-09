import "server-only";

import { USER_MESSAGES } from "@/lib/errors/messages";
import { apiRateLimited } from "@/lib/errors/api";
import {
  consumeRateLimit,
  rateLimitByIp,
  rateLimitByUser,
  type RateLimitResult,
} from "@/lib/rate-limit";
import { isRateLimitEnforced } from "@/lib/protection/config";
import { getClientIp } from "@/lib/rate-limit/client-ip";

export const RATE_LIMITS = {
  register: { limit: 5, windowSec: 3600 },
  waitlist: { limit: 8, windowSec: 3600 },
  support: { limit: 5, windowSec: 3600 },
  contact: { limit: 5, windowSec: 3600 },
  clientError: { limit: 30, windowSec: 3600 },
  share: { limit: 20, windowSec: 3600 },
  readingDaily: { limit: 40, windowSec: 86400 },
  auth: { limit: 20, windowSec: 900 },
  forgotPassword: { limit: 5, windowSec: 3600 },
  resetPassword: { limit: 10, windowSec: 900 },
  interpret: { limit: 30, windowSec: 3600 },
  oracleChat: { limit: 60, windowSec: 3600 },
  followup: { limit: 40, windowSec: 3600 },
  insights: { limit: 20, windowSec: 3600 },
  stripeCheckout: { limit: 10, windowSec: 3600 },
  stripeWebhook: { limit: 200, windowSec: 60 },
  publicApi: { limit: 100, windowSec: 60 },
} as const;

const RATE_LIMIT_OK: RateLimitResult = {
  ok: true,
  remaining: 999,
  limit: 999,
  resetAt: new Date(Date.now() + 3600_000),
};

export { isRateLimitEnforced };

export async function peekRateLimitByIp(
  request: Request,
  scope: string,
  preset: { limit: number; windowSec: number },
): Promise<RateLimitResult> {
  if (!isRateLimitEnforced()) return RATE_LIMIT_OK;
  return consumeRateLimit(
    `ip:${scope}:${getClientIp(request)}`,
    preset.limit,
    preset.windowSec,
  );
}

export async function consumeRateLimitByIp(
  request: Request,
  scope: string,
  preset: { limit: number; windowSec: number },
): Promise<RateLimitResult> {
  return rateLimitByIp(request, scope, preset);
}

export function rateLimitResponse(
  result: Extract<RateLimitResult, { ok: false }>,
  message: string = USER_MESSAGES.rateLimitedShort,
) {
  return apiRateLimited(message, result.retryAfterSec, {
    remaining: result.remaining,
    limit: result.limit,
    resetAt: result.resetAt.toISOString(),
  });
}

export { rateLimitByIp, rateLimitByUser };
