import type { ReadingCategory } from "@/types/reading-journal";

export type PatternInsightAI = {
  summary: string;
  themes: string[];
  patterns: string[];
  reflections: string[];
};

export type MonthBucket = {
  key: string;
  label: string;
  count: number;
};

export type CategoryMonthRow = {
  monthKey: string;
  monthLabel: string;
  category: ReadingCategory | "general";
  count: number;
};

export type HexagramFrequency = {
  number: number;
  title: string;
  chineseName: string;
  count: number;
};

export type ReadingInsightAnalytics = {
  totalReadings: number;
  favoriteCount: number;
  readingsThisMonth: number;
  topCategory: { id: ReadingCategory | "general"; count: number; label: string } | null;
  topHexagram: HexagramFrequency | null;
  topHexagrams: HexagramFrequency[];
  monthlyVolume: MonthBucket[];
  dominantCategoryByMonth: CategoryMonthRow[];
  categoryTotals: Record<string, number>;
  questionThemes: string[];
  revision: string;
};

export type InsightsPagePayload = {
  isPremium: boolean;
  analytics: ReadingInsightAnalytics;
  ai: PatternInsightAI | null;
  generatedAt: string | null;
  cacheHit: boolean;
  statTeaser: string;
};
