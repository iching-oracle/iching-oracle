import "server-only";

import type { CreditTransactionRow, CreditUsageRow } from "@/types/credits";
import type { CreditFeatureType, CreditTransactionType } from "@/types/credits";
import { prisma } from "@/lib/prisma";

export async function getUsageHistory(
  userId: string,
  limit = 20,
): Promise<CreditUsageRow[]> {
  const rows = await prisma.aIUsage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map((r) => ({
    id: r.id,
    featureType: r.featureType as CreditFeatureType,
    creditsUsed: r.creditsUsed,
    estimatedTokenUsage: r.estimatedTokenUsage,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getTransactionHistory(
  userId: string,
  limit = 20,
): Promise<CreditTransactionRow[]> {
  const rows = await prisma.creditTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map((r) => ({
    id: r.id,
    type: r.type as CreditTransactionType,
    amount: r.amount,
    reason: r.reason,
    createdAt: r.createdAt.toISOString(),
  }));
}
