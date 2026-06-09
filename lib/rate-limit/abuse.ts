import "server-only";

import { getRedis } from "@/lib/rate-limit/redis-client";
import { getClientIp } from "@/lib/rate-limit/client-ip";
import { PROTECTION } from "@/lib/protection/config";
import { logSystemEvent } from "@/lib/monitoring/logger";

function blockKey(ip: string): string {
  return `abuse:block:${ip}`;
}

function failKey(ip: string): string {
  return `abuse:fail:${ip}`;
}

function burstKey(ip: string): string {
  return `abuse:burst:${ip}`;
}

export async function isIpBlocked(ip: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  const until = await redis.get<number>(blockKey(ip));
  if (!until) return false;
  if (Date.now() >= until) {
    await redis.del(blockKey(ip));
    return false;
  }
  return true;
}

export async function recordRequestBurst(request: Request): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const ip = getClientIp(request);
  const count = await redis.incr(burstKey(ip));
  if (count === 1) {
    await redis.expire(burstKey(ip), 60);
  }
  if (count >= PROTECTION.abuseBurstPerMinute) {
    await blockIp(ip, PROTECTION.abuseBlockSec, "burst");
  }
}

export async function recordFailedRequest(
  request: Request,
  reason: string,
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const ip = getClientIp(request);
  const count = await redis.incr(failKey(ip));
  if (count === 1) {
    await redis.expire(failKey(ip), 300);
  }
  if (count >= PROTECTION.abuseFailThreshold) {
    await blockIp(ip, PROTECTION.abuseBlockSec, reason);
  }
}

export async function recordSuccessfulAuth(request: Request): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const ip = getClientIp(request);
  await redis.del(failKey(ip));
}

async function blockIp(
  ip: string,
  durationSec: number,
  reason: string,
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const until = Date.now() + durationSec * 1000;
  await redis.set(blockKey(ip), until, { ex: durationSec });
  await logSystemEvent({
    level: "warn",
    category: "abuse",
    message: `Temporary IP block: ${ip}`,
    metadata: { ip, reason, durationSec },
  });
}

export async function checkIpBlocked(request: Request): Promise<{
  blocked: boolean;
  retryAfterSec?: number;
}> {
  const ip = getClientIp(request);
  const redis = getRedis();
  if (!redis) return { blocked: false };

  const until = await redis.get<number>(blockKey(ip));
  if (!until || Date.now() >= until) {
    if (until) await redis.del(blockKey(ip));
    return { blocked: false };
  }

  return {
    blocked: true,
    retryAfterSec: Math.max(1, Math.ceil((until - Date.now()) / 1000)),
  };
}
