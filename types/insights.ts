import type { ReadingCategory } from "@/types/reading-journal";

export type PatternInsightAI = {
  summary: string;
  themes: string[];
  patterns: string[];
  reflections: string[];
  /** Premium: gentle emotional framing (not clinical diagnosis). */
  emotionalGuidance?: string[];
  /** Premium: long-horizon growth narrative. */
  growthSummary?: string;
  /** Premium: hexagram / consultation rhythm analysis. */
  oracleTrendAnalysis?: string;
};

export type InsightPeriodReport = {
  periodLabel: string;
  headline: string;
  body: string;
  highlights: string[];
  gentlePrompts: string[];
};

export type InsightReportType = "weekly" | "monthly";

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

export type EmotionalToneMonth = {
  monthKey: string;
  monthLabel: string;
  calm: number;
  seeking: number;
  turbulent: number;
  hopeful: number;
};

export type BehavioralTrend = {
  id: string;
  label: string;
  direction: "rising" | "steady" | "softening";
  detail: string;
};

export type SpiritualGrowthSignals = {
  reflectionDepth: "early" | "developing" | "deepening";
  categoryShiftNote: string | null;
  journalConsistency: number;
};

export type ResonanceSnapshot = {
  deeply: number;
  somewhat: number;
  notReally: number;
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
  emotionalToneByMonth: EmotionalToneMonth[];
  behavioralTrends: BehavioralTrend[];
  spiritualGrowth: SpiritualGrowthSignals;
  resonance: ResonanceSnapshot | null;
  revision: string;
};

export type InsightTimelineKind =
  | "reading"
  | "milestone"
  | "memory"
  | "report";

export type InsightTimelineEntry = {
  id: string;
  kind: InsightTimelineKind;
  title: string;
  subtitle?: string;
  createdAt: string;
  meta?: Record<string, string | number>;
};

export type OracleMilestoneDTO = {
  id: string;
  title: string;
  note: string | null;
  kind: string;
  readingId: string | null;
  createdAt: string;
};

export type InsightsPagePayload = {
  isPremium: boolean;
  analytics: ReadingInsightAnalytics;
  ai: PatternInsightAI | null;
  weeklyReport: InsightPeriodReport | null;
  monthlyReport: InsightPeriodReport | null;
  timeline: InsightTimelineEntry[];
  milestones: OracleMilestoneDTO[];
  memoryEnabled: boolean;
  memoryCount: number;
  generatedAt: string | null;
  cacheHit: boolean;
  statTeaser: string;
};

export type CreateMilestoneInput = {
  title: string;
  note?: string;
  kind?: "milestone" | "favorite_insight" | "emotional_marker";
  readingId?: string;
};
