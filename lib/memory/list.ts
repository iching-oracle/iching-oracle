import "server-only";

import { toMemoryDTO, toTimelineEntry } from "@/lib/memory/dto";
import { getMemoryLimits, memoryRetentionCutoff } from "@/lib/memory/limits";
import { prisma } from "@/lib/prisma";

export async function listMemoriesForUser(userId: string) {
  const limits = await getMemoryLimits(userId);
  const cutoff = memoryRetentionCutoff(limits.windowDays);

  const memories = await prisma.memory.findMany({
    where: {
      userId,
      ...(cutoff ? { updatedAt: { gte: cutoff } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: limits.maxMemories,
  });

  return memories.map(toMemoryDTO);
}

export async function listTimelineForUser(userId: string) {
  const limits = await getMemoryLimits(userId);
  if (!limits.canUseTimeline) return [];

  const memories = await prisma.memory.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return memories.map(toTimelineEntry);
}

export async function deleteMemory(
  userId: string,
  memoryId: string,
): Promise<boolean> {
  const result = await prisma.memory.deleteMany({
    where: { id: memoryId, userId },
  });
  return result.count > 0;
}

export async function clearAllMemories(userId: string): Promise<number> {
  const result = await prisma.memory.deleteMany({ where: { userId } });
  await prisma.memoryEvent.create({
    data: {
      userId,
      source: "manual",
      note: `Cleared ${result.count} memories`,
    },
  });
  return result.count;
}
