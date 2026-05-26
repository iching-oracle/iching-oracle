import "server-only";

import {
  MAX_MEMORIES_INJECTED,
  MAX_MEMORY_PROMPT_CHARS,
} from "@/lib/memory/constants";
import { similarityScore } from "@/lib/memory/similarity";
import { isMemoryEnabledForUser } from "@/lib/memory/settings";
import { getMemoryLimits, memoryRetentionCutoff } from "@/lib/memory/limits";
import { prisma } from "@/lib/prisma";
import type { Memory } from "@prisma/client";

export type RetrievedMemory = Pick<
  Memory,
  "id" | "type" | "summary" | "confidence" | "tags"
> & {
  updatedAt: Date;
  occurrenceCount: number;
};

function scoreMemory(
  memory: RetrievedMemory,
  queryText: string,
  now: number,
): number {
  const semantic = similarityScore(memory.summary, queryText);
  const recencyDays =
    (now - memory.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  const recencyBoost = Math.max(0, 1 - recencyDays / 90) * 0.2;
  const confidenceBoost = memory.confidence * 0.35;
  const occurrenceBoost = Math.min(memory.occurrenceCount, 5) * 0.05;

  return semantic * 0.4 + recencyBoost + confidenceBoost + occurrenceBoost;
}

export async function retrieveRelevantMemories(
  userId: string,
  queryText: string,
  context: string,
  contextId?: string,
): Promise<RetrievedMemory[]> {
  if (!(await isMemoryEnabledForUser(userId))) return [];

  const limits = await getMemoryLimits(userId);
  const cutoff = memoryRetentionCutoff(limits.windowDays);

  const memories = await prisma.memory.findMany({
    where: {
      userId,
      ...(cutoff ? { updatedAt: { gte: cutoff } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: limits.isPremium ? 40 : 15,
    select: {
      id: true,
      type: true,
      summary: true,
      confidence: true,
      tags: true,
      updatedAt: true,
      occurrenceCount: true,
    },
  });

  if (memories.length === 0) return [];

  const now = Date.now();
  const ranked = memories
    .map((m) => ({ memory: m, score: scoreMemory(m, queryText, now) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_MEMORIES_INJECTED)
    .filter((r) => r.score > 0.25)
    .map((r) => r.memory);

  if (ranked.length > 0) {
    const ids = ranked.map((m) => m.id);
    await prisma.memory.updateMany({
      where: { id: { in: ids } },
      data: { lastReferencedAt: new Date() },
    });
    await prisma.memoryReference.createMany({
      data: ranked.map((m) => ({
        userId,
        memoryId: m.id,
        context,
        contextId,
      })),
    });
  }

  return ranked;
}

export function formatMemoriesForPrompt(
  memories: RetrievedMemory[],
): string {
  if (memories.length === 0) return "";

  const lines = memories.map(
    (m) => `- [${m.type.replace(/_/g, " ")}] ${m.summary}`,
  );

  let block = `GENTLE MEMORY (reference subtly if relevant — never say "I remember everything" or use surveillance tone):
${lines.join("\n")}

When using memory, prefer phrases like "a familiar theme may be returning" or "this may connect with something you've reflected on before."`;

  if (block.length > MAX_MEMORY_PROMPT_CHARS) {
    block = `${block.slice(0, MAX_MEMORY_PROMPT_CHARS)}…`;
  }

  return block;
}
