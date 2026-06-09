import "server-only";

import {
  getTokenCostPer1k,
  type RateLimitTier,
} from "@/lib/protection/config";
import { prisma } from "@/lib/prisma";

export function estimateCostUsd(tokenCount: number): number {
  if (tokenCount <= 0) return 0;
  return (tokenCount / 1000) * getTokenCostPer1k();
}

export async function touchUserActivity(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { lastActivityAt: new Date() },
  });
}

export type UsageRecordInput = {
  userId: string;
  featureType: string;
  creditsUsed: number;
  estimatedTokenUsage?: number;
};

/** Augment AI usage row with estimated USD cost. */
export async function recordAiUsageCost(params: {
  userId: string;
  featureType: string;
  creditsUsed: number;
  estimatedTokenUsage?: number;
}): Promise<void> {
  const cost = estimateCostUsd(params.estimatedTokenUsage ?? 0);
  await prisma.aIUsage.create({
    data: {
      userId: params.userId,
      featureType: params.featureType,
      creditsUsed: params.creditsUsed,
      estimatedTokenUsage: params.estimatedTokenUsage,
      estimatedCostUsd: cost > 0 ? cost : null,
    },
  });
  await touchUserActivity(params.userId);
}

export async function getUserUsageSummary(userId: string) {
  const [total, tokens, cost, last] = await Promise.all([
    prisma.aIUsage.count({ where: { userId } }),
    prisma.aIUsage.aggregate({
      where: { userId },
      _sum: { estimatedTokenUsage: true },
    }),
    prisma.aIUsage.aggregate({
      where: { userId },
      _sum: { estimatedCostUsd: true },
    }),
    prisma.aIUsage.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  return {
    totalGenerations: total,
    totalTokens: tokens._sum.estimatedTokenUsage ?? 0,
    estimatedCostUsd: cost._sum.estimatedCostUsd ?? 0,
    lastActiveAt: last?.createdAt ?? null,
  };
}

export async function getAdminUsageStats() {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 86_400_000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);

  const [
    dailyTokens,
    dailyCost,
    dailyGenerations,
    monthlyCost,
    monthlyGenerations,
    topUsers,
    suspicious,
    tokensByDay,
  ] = await Promise.all([
    prisma.aIUsage.aggregate({
      where: { createdAt: { gte: dayAgo } },
      _sum: { estimatedTokenUsage: true, estimatedCostUsd: true },
      _count: true,
    }),
    prisma.aIUsage.aggregate({
      where: { createdAt: { gte: thirtyDaysAgo } },
      _sum: { estimatedCostUsd: true },
    }),
    prisma.aIUsage.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.aIUsage.aggregate({
      where: { createdAt: { gte: thirtyDaysAgo } },
      _sum: { estimatedCostUsd: true },
    }),
    prisma.aIUsage.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.aIUsage.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _sum: { estimatedTokenUsage: true, estimatedCostUsd: true, creditsUsed: true },
      _count: true,
      orderBy: { _count: { userId: "desc" } },
      take: 12,
    }),
    prisma.systemEvent.findMany({
      where: {
        category: "abuse",
        createdAt: { gte: dayAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.$queryRaw<Array<{ day: Date; tokens: bigint; gens: bigint }>>`
      SELECT DATE_TRUNC('day', "createdAt") AS day,
             COALESCE(SUM("estimatedTokenUsage"), 0)::bigint AS tokens,
             COUNT(*)::bigint AS gens
      FROM "AIUsage"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY 1
      ORDER BY 1 ASC
    `,
  ]);

  const userIds = topUsers.map((u) => u.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, planType: true, role: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return {
    dailyGenerations,
    dailyTokens: dailyTokens._sum.estimatedTokenUsage ?? 0,
    dailyCostUsd: dailyTokens._sum.estimatedCostUsd ?? 0,
    monthlyGenerations,
    monthlyCostUsd: monthlyCost._sum.estimatedCostUsd ?? 0,
    topUsers: topUsers.map((row) => ({
      userId: row.userId,
      email: userMap.get(row.userId)?.email ?? "—",
      planType: userMap.get(row.userId)?.planType ?? "FREE",
      role: userMap.get(row.userId)?.role ?? "USER",
      generations: (row._count as { _all?: number })._all ?? 0,
      tokens: row._sum.estimatedTokenUsage ?? 0,
      costUsd: row._sum.estimatedCostUsd ?? 0,
      credits: row._sum.creditsUsed ?? 0,
    })),
    suspiciousEvents: suspicious.map((e) => ({
      id: e.id,
      message: e.message,
      createdAt: e.createdAt.toISOString(),
      metadata: e.metadata,
    })),
    tokensByDay: tokensByDay.map((r) => ({
      day: r.day.toISOString().slice(0, 10),
      tokens: Number(r.tokens),
      generations: Number(r.gens),
    })),
  };
}

export function tierQuotaMessage(
  tier: RateLimitTier,
  retryAfterSec?: number,
): string {
  const wait =
    retryAfterSec && retryAfterSec > 0
      ? ` Please wait about ${Math.ceil(retryAfterSec / 60)} minute(s).`
      : "";
  if (tier === "guest") {
    return `Guest access is very limited.${wait} Sign in for a fuller allowance.`;
  }
  if (tier === "free") {
    return `You've reached your guidance allowance for now.${wait} Explore membership for more space.`;
  }
  return `Please pause before your next consultation.${wait}`;
}
