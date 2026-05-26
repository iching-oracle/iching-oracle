import "server-only";

import { getMemoryLimits, memoryRetentionCutoff } from "@/lib/memory/limits";
import { prisma } from "@/lib/prisma";

/** Trim memories to plan limits — lowest confidence / oldest first. */
export async function enforceMemoryCap(userId: string): Promise<void> {
  const limits = await getMemoryLimits(userId);
  const cutoff = memoryRetentionCutoff(limits.windowDays);

  if (cutoff) {
    await prisma.memory.deleteMany({
      where: { userId, createdAt: { lt: cutoff } },
    });
  }

  const count = await prisma.memory.count({ where: { userId } });
  if (count <= limits.maxMemories) return;

  const excess = count - limits.maxMemories;
  const toRemove = await prisma.memory.findMany({
    where: { userId },
    orderBy: [{ confidence: "asc" }, { updatedAt: "asc" }],
    take: excess,
    select: { id: true },
  });

  await prisma.memory.deleteMany({
    where: { id: { in: toRemove.map((m) => m.id) } },
  });
}
