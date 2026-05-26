export const MEMORY_TYPES = [
  "emotional_pattern",
  "recurring_theme",
  "relationship",
  "career",
  "spiritual",
  "life_transition",
  "oracle_pattern",
] as const;

export type MemoryType = (typeof MEMORY_TYPES)[number];

export type MemorySource =
  | "oracle_chat"
  | "reading"
  | "insight"
  | "manual"
  | "scheduled";

export type MemoryDTO = {
  id: string;
  type: MemoryType;
  summary: string;
  confidence: number;
  tags: string[];
  occurrenceCount: number;
  lastReferencedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MemorySettingsDTO = {
  memoryEnabled: boolean;
  isPremium: boolean;
  memoryCount: number;
  memoryLimit: number | null;
  canUseTimeline: boolean;
};

export type MemoryTimelineEntry = {
  id: string;
  type: MemoryType;
  summary: string;
  confidence: number;
  tags: string[];
  createdAt: string;
  period: "recent" | "emerging" | "established";
};
