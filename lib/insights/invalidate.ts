import "server-only";

import { prisma } from "@/lib/prisma";

export async function invalidatePatternInsightCache(
  userId: string,
): Promise<void> {
  try {
    await prisma.patternInsightCache.deleteMany({ where: { userId } });
  } catch {
    /* non-critical */
  }
}
