import type { OracleMemorySnapshot } from "@/lib/oracle-chat/memory-types";

/** Legacy placeholder — prefer persisted Memory model. */
export function buildMemorySnapshotPlaceholder(
  userId: string,
): OracleMemorySnapshot {
  return {
    userId,
    recurringThemes: [],
    relationshipPatterns: [],
    emotionalCycles: [],
    timelineNotes: [],
  };
}
