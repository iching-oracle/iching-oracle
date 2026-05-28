import type { ReadingCategory } from "@/types/reading-journal";

export type GuidedStep =
  | "hero"
  | "category"
  | "question"
  | "ritual"
  | "reading"
  | "share";

export type GuidedReadingResult = {
  readingId: string;
  question: string;
  lineValues: number[];
  hexagram: number;
  transformedHexagram: number | null;
  primaryTitle: string;
  chineseName: string;
  judgment: string;
  finalTitle: string | null;
  interpretation: string;
  isPremium: boolean;
  interpretationPending: boolean;
  quote: string;
  category: ReadingCategory;
};

export type DisplaySection = {
  id: string;
  title: string;
  content: string;
  premiumOnly?: boolean;
};

export type RevealBlock =
  | { type: "hexagram"; id: string }
  | { type: "hexagram-name"; id: string }
  | { type: "core-meaning"; id: string; content: string }
  | { type: "interpretation"; id: string; title: string; content: string; premiumOnly?: boolean }
  | { type: "changing-lines"; id: string; content: string }
  | { type: "guidance"; id: string; content: string }
  | { type: "reflection"; id: string; content: string };
