import type { InterpretationMode } from "@/types/interpretation";

export type ReadingCategory =
  | "love"
  | "career"
  | "finance"
  | "health"
  | "spirituality"
  | "family"
  | "general";

export type ReadingSortOrder = "desc" | "asc";

export type ReadingViewMode = "grid" | "timeline";

export type JournalReadingItem = {
  id: string;
  question: string;
  primaryHexagramNumber: number;
  primaryHexagramName: string;
  resultingHexagramNumber: number | null;
  resultingHexagramName: string | null;
  changingLines: number[];
  interpretationSummary: string;
  summary: string | null;
  category: ReadingCategory;
  interpretationMode: InterpretationMode;
  isFavorite: boolean;
  createdAt: Date;
};

export type ReadingJournalQuery = {
  q?: string;
  category?: ReadingCategory | "all";
  mode?: InterpretationMode | "all";
  view?: ReadingViewMode;
  favorite?: boolean;
  sort?: ReadingSortOrder;
  page?: number;
  pageSize?: number;
};

export type ReadingJournalResult = {
  items: JournalReadingItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const READING_CATEGORIES: Array<{
  id: ReadingCategory;
  label: string;
}> = [
  { id: "general", label: "General" },
  { id: "love", label: "Love" },
  { id: "career", label: "Career" },
  { id: "finance", label: "Finance" },
  { id: "health", label: "Health" },
  { id: "spirituality", label: "Spirituality" },
  { id: "family", label: "Family" },
];
