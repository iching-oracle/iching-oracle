import type { MemoryType } from "@/types/memory";

export const MEMORY_TYPE_LABELS: Record<MemoryType, string> = {
  emotional_pattern: "Emotional pattern",
  recurring_theme: "Recurring theme",
  relationship: "Relationship",
  career: "Career",
  spiritual: "Spiritual",
  life_transition: "Life transition",
  oracle_pattern: "Oracle symbolism",
};

export const FREE_MEMORY_MAX = 5;
export const PREMIUM_MEMORY_MAX = 50;
export const FREE_MEMORY_WINDOW_DAYS = 14;
export const MEMORY_EXTRACT_DEBOUNCE_MS = 5 * 60 * 1000;
export const MAX_MEMORIES_INJECTED = 3;
export const MAX_MEMORY_PROMPT_CHARS = 600;
