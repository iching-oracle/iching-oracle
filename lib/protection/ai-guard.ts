import "server-only";

import { getRedis } from "@/lib/rate-limit/redis-client";
import { PROTECTION } from "@/lib/protection/config";
import { prisma } from "@/lib/prisma";

export type AiGuardResult =
  | { ok: true }
  | { ok: false; reason: string; retryAfterSec?: number };

async function getGlobalHourlyGenerations(): Promise<number> {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return prisma.aIUsage.count({ where: { createdAt: { gte: hourAgo } } });
}

async function getGlobalDailyTokens(): Promise<number> {
  const dayAgo = new Date(Date.now() - 86_400_000);
  const agg = await prisma.aIUsage.aggregate({
    where: { createdAt: { gte: dayAgo } },
    _sum: { estimatedTokenUsage: true },
  });
  return agg._sum.estimatedTokenUsage ?? 0;
}

export async function assertGlobalAiCaps(): Promise<AiGuardResult> {
  if (PROTECTION.globalHourlyGenerationCap > 0) {
    const hourly = await getGlobalHourlyGenerations();
    if (hourly >= PROTECTION.globalHourlyGenerationCap) {
      return {
        ok: false,
        reason:
          "The oracle is receiving many visitors. Please wait a moment and try again.",
        retryAfterSec: 300,
      };
    }
  }

  if (PROTECTION.globalDailyTokenCap > 0) {
    const tokens = await getGlobalDailyTokens();
    if (tokens >= PROTECTION.globalDailyTokenCap) {
      return {
        ok: false,
        reason:
          "Daily guidance capacity has been reached. Please return tomorrow.",
        retryAfterSec: 3600,
      };
    }
  }

  const redis = getRedis();
  if (redis) {
    const emergency = await redis.get<string>("protection:ai:emergency");
    if (emergency === "1") {
      return {
        ok: false,
        reason: "AI generation is temporarily paused for maintenance.",
        retryAfterSec: 600,
      };
    }
  }

  return { ok: true };
}
