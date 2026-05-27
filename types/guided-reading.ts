import type { ReadingCategory } from "@/types/reading-journal";

export type GuidedStep =
  | "welcome"
  | "question"
  | "casting"
  | "reveal"
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
