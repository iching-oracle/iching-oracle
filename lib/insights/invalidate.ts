import "server-only";

import { invalidateInsightReports } from "@/lib/insights/reports";
import { prisma } from "@/lib/prisma";

export async function invalidatePatternInsightCache(
  userId: string,
): Promise<void> {
  try {
    await Promise.all([
      prisma.patternInsightCache.deleteMany({ where: { userId } }),
      invalidateInsightReports(userId),
    ]);
  } catch {
    /* non-critical */
  }
}
