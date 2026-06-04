import "server-only";

import { getHexagram } from "@/lib/hexagrams";
import { getCategoryLabel } from "@/lib/readings/category";
import { isReadingCategory } from "@/lib/readings/category";
import { listMemoriesForUser } from "@/lib/memory/list";
import type { InsightTimelineEntry } from "@/types/insights";
import type { OracleMilestoneDTO } from "@/types/insights";

type ReadingSlice = {
  id: string;
  question: string;
  category: string;
  hexagram: number;
  createdAt: Date;
  isFavorite: boolean;
};

export async function buildInsightTimeline(
  userId: string,
  readings: ReadingSlice[],
  milestones: OracleMilestoneDTO[],
  memoryEnabled: boolean,
  limit = 24,
): Promise<InsightTimelineEntry[]> {
  const entries: InsightTimelineEntry[] = [];

  for (const m of milestones) {
    entries.push({
      id: m.id,
      kind: "milestone",
      title: m.title,
      subtitle: m.note ?? undefined,
      createdAt: m.createdAt,
      meta: { milestoneKind: m.kind },
    });
  }

  for (const r of readings.slice(0, 12)) {
    const hex = getHexagram(r.hexagram);
    const cat = isReadingCategory(r.category)
      ? getCategoryLabel(r.category)
      : r.category;
    entries.push({
      id: r.id,
      kind: "reading",
      title: r.question.length > 72 ? `${r.question.slice(0, 69)}…` : r.question,
      subtitle: `${hex.chineseName} · ${cat}`,
      createdAt: r.createdAt.toISOString(),
      meta: { hexagram: r.hexagram, favorite: r.isFavorite ? 1 : 0 },
    });
  }

  if (memoryEnabled) {
    const memories = (await listMemoriesForUser(userId)).slice(0, 6);
    for (const mem of memories) {
      entries.push({
        id: mem.id,
        kind: "memory",
        title: mem.summary.length > 80 ? `${mem.summary.slice(0, 77)}…` : mem.summary,
        subtitle: mem.type.replace(/_/g, " "),
        createdAt: mem.createdAt,
      });
    }
  }

  return entries
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
}
