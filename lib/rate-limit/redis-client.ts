import { Redis } from "@upstash/redis";
import { hasUpstashRedis } from "@/lib/protection/config";

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (!hasUpstashRedis()) return null;
  if (!redis) {
    redis = Redis.fromEnv();
  }
  return redis;
}
