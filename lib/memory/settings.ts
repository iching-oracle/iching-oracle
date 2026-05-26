import "server-only";

import { getMemoryLimits } from "@/lib/memory/limits";
import { prisma } from "@/lib/prisma";
import type { MemorySettingsDTO } from "@/types/memory";

export async function getMemorySettings(
  userId: string,
): Promise<MemorySettingsDTO> {
  const [user, limits, memoryCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { memoryEnabled: true },
    }),
    getMemoryLimits(userId),
    prisma.memory.count({ where: { userId } }),
  ]);

  return {
    memoryEnabled: user?.memoryEnabled ?? true,
    isPremium: limits.isPremium,
    memoryCount,
    memoryLimit: limits.maxMemories,
    canUseTimeline: limits.canUseTimeline,
  };
}

export async function setMemoryEnabled(
  userId: string,
  enabled: boolean,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { memoryEnabled: enabled },
  });
}

export async function isMemoryEnabledForUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { memoryEnabled: true },
  });
  return user?.memoryEnabled ?? true;
}
