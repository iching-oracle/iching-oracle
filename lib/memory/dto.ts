import type { Memory } from "@prisma/client";
import type { MemoryDTO, MemoryTimelineEntry, MemoryType } from "@/types/memory";
import { MEMORY_TYPES } from "@/types/memory";

export function isMemoryType(value: string): value is MemoryType {
  return (MEMORY_TYPES as readonly string[]).includes(value);
}

export function toMemoryDTO(memory: Memory): MemoryDTO {
  return {
    id: memory.id,
    type: isMemoryType(memory.type) ? memory.type : "recurring_theme",
    summary: memory.summary,
    confidence: memory.confidence,
    tags: memory.tags,
    occurrenceCount: memory.occurrenceCount,
    lastReferencedAt: memory.lastReferencedAt?.toISOString() ?? null,
    createdAt: memory.createdAt.toISOString(),
    updatedAt: memory.updatedAt.toISOString(),
  };
}

export function toTimelineEntry(memory: Memory): MemoryTimelineEntry {
  const ageDays =
    (Date.now() - memory.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const period: MemoryTimelineEntry["period"] =
    ageDays < 14
      ? "recent"
      : memory.occurrenceCount >= 3
        ? "established"
        : "emerging";

  return {
    id: memory.id,
    type: isMemoryType(memory.type) ? memory.type : "recurring_theme",
    summary: memory.summary,
    confidence: memory.confidence,
    tags: memory.tags,
    createdAt: memory.createdAt.toISOString(),
    period,
  };
}
