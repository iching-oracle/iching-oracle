import "server-only";

import { MEMORY_EXTRACT_DEBOUNCE_MS } from "@/lib/memory/constants";
import { extractMemoriesForUser } from "@/lib/memory/extract";
import { isMemoryEnabledForUser } from "@/lib/memory/settings";
import type { MemorySource } from "@/types/memory";
import { prisma } from "@/lib/prisma";

const inFlight = new Set<string>();

/**
 * Non-blocking memory extraction with debounce per user.
 */
export function scheduleMemoryExtraction(
  userId: string,
  source: MemorySource,
  sourceId?: string,
): void {
  void runDebouncedExtraction(userId, source, sourceId).catch((err) => {
    console.error("[memory/schedule]", err);
  });
}

async function runDebouncedExtraction(
  userId: string,
  source: MemorySource,
  sourceId?: string,
): Promise<void> {
  if (inFlight.has(userId)) return;

  if (!(await isMemoryEnabledForUser(userId))) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { memoryLastExtractedAt: true },
  });

  if (user?.memoryLastExtractedAt) {
    const elapsed = Date.now() - user.memoryLastExtractedAt.getTime();
    if (elapsed < MEMORY_EXTRACT_DEBOUNCE_MS) return;
  }

  inFlight.add(userId);
  try {
    await extractMemoriesForUser(userId, source, sourceId);
  } finally {
    inFlight.delete(userId);
  }
}
