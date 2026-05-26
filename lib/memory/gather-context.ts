import "server-only";

import { memoryRetentionCutoff } from "@/lib/memory/limits";
import { getMemoryLimits } from "@/lib/memory/limits";
import { extractReadingSummary } from "@/lib/readings/summary";
import { prisma } from "@/lib/prisma";

export type MemoryExtractionContext = {
  oracleSnippets: string[];
  readingSnippets: string[];
  existingMemories: Array<{ type: string; summary: string; tags: string[] }>;
};

/** Summarized signals only — never full transcripts. */
export async function gatherMemoryExtractionContext(
  userId: string,
): Promise<MemoryExtractionContext> {
  const limits = await getMemoryLimits(userId);
  const cutoff = memoryRetentionCutoff(limits.windowDays);

  const readingWhere = {
    userId,
    ...(cutoff ? { createdAt: { gte: cutoff } } : {}),
  };

  const [oracleMessages, readings, existingMemories] = await Promise.all([
    prisma.oracleMessage.findMany({
      where: {
        conversation: { userId },
        role: "user",
        ...(cutoff ? { createdAt: { gte: cutoff } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { content: true },
    }),
    prisma.reading.findMany({
      where: readingWhere,
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        question: true,
        category: true,
        summary: true,
        interpretation: true,
        hexagram: true,
        primaryHexagramName: true,
      },
    }),
    prisma.memory.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: { type: true, summary: true, tags: true },
    }),
  ]);

  const oracleSnippets = oracleMessages
    .map((m) => sanitizeSnippet(m.content, 200))
    .filter(Boolean)
    .reverse();

  const readingSnippets = readings.map((r) => {
    const summary =
      r.summary?.trim() ||
      extractReadingSummary(r.interpretation).slice(0, 180);
    return sanitizeSnippet(
      `Question: ${r.question.slice(0, 120)} | Hexagram ${r.hexagram} ${r.primaryHexagramName ?? ""} | Theme: ${r.category} | ${summary}`,
      280,
    );
  });

  return {
    oracleSnippets,
    readingSnippets,
    existingMemories,
  };
}

function sanitizeSnippet(text: string, max: number): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}
