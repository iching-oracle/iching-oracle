import "server-only";

import { areMemoriesSimilar } from "@/lib/memory/similarity";
import { prisma } from "@/lib/prisma";
import type { MemoryType } from "@/types/memory";
import { isMemoryType } from "@/lib/memory/dto";

export type ExtractedMemoryCandidate = {
  type: string;
  summary: string;
  confidence: number;
  tags: string[];
};

export async function mergeMemoryCandidates(
  userId: string,
  candidates: ExtractedMemoryCandidate[],
  source: string,
  sourceId?: string,
): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;

  const existing = await prisma.memory.findMany({
    where: { userId },
    select: { id: true, type: true, summary: true, confidence: true, tags: true, occurrenceCount: true },
  });

  for (const candidate of candidates) {
    const type = isMemoryType(candidate.type)
      ? candidate.type
      : "recurring_theme";
    const summary = candidate.summary.trim().slice(0, 500);
    if (summary.length < 12) continue;

    const tags = candidate.tags
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 8);

    const match = existing.find((m) =>
      areMemoriesSimilar(
        { summary: m.summary, type: m.type },
        { summary, type },
      ),
    );

    if (match) {
      const newConfidence = Math.min(
        0.95,
        (match.confidence + candidate.confidence) / 2 + 0.05,
      );
      await prisma.memory.update({
        where: { id: match.id },
        data: {
          summary: newConfidence > match.confidence ? summary : match.summary,
          confidence: newConfidence,
          occurrenceCount: match.occurrenceCount + 1,
          tags: [...new Set([...match.tags, ...tags])].slice(0, 8),
          updatedAt: new Date(),
        },
      });
      await prisma.memoryEvent.create({
        data: {
          userId,
          memoryId: match.id,
          source,
          sourceId,
          note: "Reinforced existing memory",
        },
      });
      updated += 1;
    } else {
      const memory = await prisma.memory.create({
        data: {
          userId,
          type: type as MemoryType,
          summary,
          confidence: Math.min(0.9, Math.max(0.3, candidate.confidence)),
          tags,
        },
      });
      existing.push({
        id: memory.id,
        type: memory.type,
        summary: memory.summary,
        confidence: memory.confidence,
        tags: memory.tags,
        occurrenceCount: 1,
      });
      await prisma.memoryEvent.create({
        data: {
          userId,
          memoryId: memory.id,
          source,
          sourceId,
          note: "New memory extracted",
        },
      });
      created += 1;
    }
  }

  return { created, updated };
}
