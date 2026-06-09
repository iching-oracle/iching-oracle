import "server-only";

import { NextResponse } from "next/server";
import { checkIpBlocked, recordRequestBurst } from "@/lib/rate-limit/abuse";
import {
  enforceApiBurst,
  enforceReadingCooldown,
  enforceTierAiLimits,
  rateLimitByIp,
  rateLimitByUser,
  type RateLimitResult,
} from "@/lib/rate-limit";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit/presets";
import { assertAiEnabled, assertNotInMaintenance } from "@/lib/protection/maintenance";
import { assertGlobalAiCaps } from "@/lib/protection/ai-guard";
import { tierQuotaMessage } from "@/lib/usage-tracking";
import { resolveUserTier } from "@/lib/rate-limit";

export type RouteGuardOptions = {
  request: Request;
  scope: string;
  ipPreset?: { limit: number; windowSec: number };
  userId?: string | null;
  role?: string | null;
  ai?: boolean;
  reading?: boolean;
};

async function blockedResponse(
  request: Request,
): Promise<NextResponse | null> {
  const blocked = await checkIpBlocked(request);
  if (!blocked.blocked) return null;
  return rateLimitResponse(
    {
      ok: false,
      remaining: 0,
      limit: 0,
      resetAt: new Date(Date.now() + (blocked.retryAfterSec ?? 60) * 1000),
      retryAfterSec: blocked.retryAfterSec ?? 60,
    },
    "Too many requests from this network. Please pause and try again.",
  );
}

export async function guardPublicRoute(
  options: RouteGuardOptions,
): Promise<NextResponse | null> {
  const maintenance = assertNotInMaintenance();
  if (maintenance) return maintenance;

  const blocked = await blockedResponse(options.request);
  if (blocked) return blocked;

  void recordRequestBurst(options.request);

  if (options.ipPreset) {
    const ip = await rateLimitByIp(
      options.request,
      options.scope,
      options.ipPreset,
    );
    if (!ip.ok) return rateLimitResponse(ip);
  }

  const burst = await enforceApiBurst({
    request: options.request,
    userId: options.userId,
    role: options.role,
    scope: options.scope,
  });
  if (!burst.ok) return rateLimitResponse(burst);

  return null;
}

export async function guardAiRoute(
  options: RouteGuardOptions,
): Promise<NextResponse | null> {
  const base = await guardPublicRoute(options);
  if (base) return base;

  const aiOff = assertAiEnabled();
  if (aiOff) return aiOff;

  const global = await assertGlobalAiCaps();
  if (!global.ok) {
    return rateLimitResponse(
      {
        ok: false,
        remaining: 0,
        limit: 0,
        resetAt: new Date(
          Date.now() + (global.retryAfterSec ?? 300) * 1000,
        ),
        retryAfterSec: global.retryAfterSec ?? 300,
      },
      global.reason,
    );
  }

  if (options.userId) {
    const tier = await resolveUserTier({
      userId: options.userId,
      role: options.role,
    });
    const tierLimit = await enforceTierAiLimits({
      userId: options.userId,
      role: options.role,
    });
    if (!tierLimit.ok) {
      return rateLimitResponse(
        tierLimit,
        tierQuotaMessage(tier, tierLimit.retryAfterSec),
      );
    }

    if (options.reading) {
      const cooldown = await enforceReadingCooldown({
        userId: options.userId,
        role: options.role,
      });
      if (!cooldown.ok) {
        return rateLimitResponse(
          cooldown,
          `Please wait ${cooldown.retryAfterSec} seconds before your next reading.`,
        );
      }
    }
  }

  return null;
}

export async function guardAuthRoute(
  request: Request,
  scope: string,
  preset: { limit: number; windowSec: number },
): Promise<NextResponse | null> {
  return guardPublicRoute({ request, scope, ipPreset: preset });
}

export async function guardShareRoute(
  request: Request,
  userId: string,
  role?: string | null,
): Promise<NextResponse | null> {
  const base = await guardPublicRoute({
    request,
    scope: "share",
    userId,
    role,
    ipPreset: RATE_LIMITS.share,
  });
  if (base) return base;

  const user = await rateLimitByUser(userId, "share", RATE_LIMITS.share);
  if (!user.ok) return rateLimitResponse(user);
  return null;
}

export async function guardStripeRoute(
  request: Request,
  scope: string = "stripe",
  preset: { limit: number; windowSec: number } = RATE_LIMITS.stripeWebhook,
): Promise<NextResponse | null> {
  const blocked = await blockedResponse(request);
  if (blocked) return blocked;
  const ip = await rateLimitByIp(request, scope, preset);
  if (!ip.ok) return rateLimitResponse(ip);
  return null;
}

export function isRateLimited(
  result: RateLimitResult,
): result is Extract<RateLimitResult, { ok: false }> {
  return !result.ok;
}
