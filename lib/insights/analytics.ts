import "server-only";

import { getHexagram } from "@/lib/hexagrams";
import { getCategoryLabel } from "@/lib/readings/category";
import { isReadingCategory } from "@/lib/readings/category";
import type {
  ReadingInsightAnalytics,
  MonthBucket,
  CategoryMonthRow,
  HexagramFrequency,
} from "@/types/insights";
import type { ReadingCategory } from "@/types/reading-journal";

export type ReadingInsightRow = {
  id: string;
  question: string;
  category: string;
  hexagram: number;
  transformedHexagram: number | null;
  createdAt: Date;
  isFavorite: boolean;
  summary: string | null;
};

const TRANSFORM_WEIGHT = 0.5;

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(d: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(
    d,
  );
}

function countQuestionThemes(questions: string[]): string[] {
  const themes: Record<string, number> = {};
  const rules: Array<{ label: string; test: RegExp }> = [
    {
      label: "transition & uncertainty",
      test: /\b(change|transition|uncertain|when|if|should i|decision|choose)\b/i,
    },
    {
      label: "relationships",
      test: /\b(love|partner|relationship|marriage|friend)\b/i,
    },
    {
      label: "work & direction",
      test: /\b(career|job|work|business|path)\b/i,
    },
    {
      label: "inner peace & stress",
      test: /\b(stress|anxiety|calm|peace|fear|worry)\b/i,
    },
    {
      label: "purpose & meaning",
      test: /\b(purpose|meaning|spiritual|soul|path)\b/i,
    },
  ];

  for (const q of questions) {
    for (const { label, test } of rules) {
      if (test.test(q)) {
        themes[label] = (themes[label] ?? 0) + 1;
      }
    }
  }

  return Object.entries(themes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label]) => label);
}

export function buildStatTeaser(analytics: ReadingInsightAnalytics): string {
  if (analytics.totalReadings === 0) {
    return "Your journal is quiet — once you save readings, patterns will emerge here.";
  }
  const parts: string[] = [];
  parts.push(`${analytics.totalReadings} consultation${analytics.totalReadings === 1 ? "" : "s"} recorded.`);
  if (analytics.topCategory) {
    parts.push(`Most common focus: ${analytics.topCategory.label}.`);
  }
  if (analytics.topHexagram) {
    parts.push(`A recurring hexagram: ${analytics.topHexagram.chineseName} (${analytics.topHexagram.title}).`);
  }
  if (analytics.readingsThisMonth > 0) {
    parts.push(`${analytics.readingsThisMonth} in the last 30 days.`);
  }
  return parts.join(" ");
}

export function computeReadingAnalytics(
  readings: ReadingInsightRow[],
  locale = "en-US",
): ReadingInsightAnalytics {
  if (readings.length === 0) {
    return {
      totalReadings: 0,
      favoriteCount: 0,
      readingsThisMonth: 0,
      topCategory: null,
      topHexagram: null,
      topHexagrams: [],
      monthlyVolume: [],
      dominantCategoryByMonth: [],
      categoryTotals: {},
      questionThemes: [],
      revision: "0_none",
    };
  }

  const sorted = [...readings].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
  const revision = `${sorted.length}_${sorted[0]!.createdAt.toISOString()}`;

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const favoriteCount = readings.filter((r) => r.isFavorite).length;
  const readingsThisMonth = readings.filter(
    (r) => r.createdAt >= thirtyDaysAgo,
  ).length;

  const categoryTotals: Record<string, number> = {};
  for (const r of readings) {
    const cat = isReadingCategory(r.category) ? r.category : "general";
    categoryTotals[cat] = (categoryTotals[cat] ?? 0) + 1;
  }

  let topCat: ReadingInsightAnalytics["topCategory"] = null;
  for (const [id, count] of Object.entries(categoryTotals)) {
    const cid = isReadingCategory(id) ? id : "general";
    if (!topCat || count > topCat.count) {
      topCat = {
        id: cid,
        count,
        label: getCategoryLabel(cid),
      };
    }
  }

  const hexWeights = new Map<number, number>();
  for (const r of readings) {
    hexWeights.set(r.hexagram, (hexWeights.get(r.hexagram) ?? 0) + 1);
    if (r.transformedHexagram) {
      const t = r.transformedHexagram;
      hexWeights.set(t, (hexWeights.get(t) ?? 0) + TRANSFORM_WEIGHT);
    }
  }

  const topHexagrams: HexagramFrequency[] = [...hexWeights.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([number, count]) => {
      const h = getHexagram(number);
      return {
        number,
        title: h.title,
        chineseName: h.chineseName,
        count: Math.round(count * 10) / 10,
      };
    });

  const topHexagram = topHexagrams[0] ?? null;

  const monthCounts = new Map<string, { count: number; sample: Date }>();
  for (const r of readings) {
    const key = monthKey(r.createdAt);
    const prev = monthCounts.get(key);
    if (prev) {
      prev.count += 1;
    } else {
      monthCounts.set(key, { count: 1, sample: r.createdAt });
    }
  }

  const monthlyVolume: MonthBucket[] = [...monthCounts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([key, { count, sample }]) => ({
      key,
      label: monthLabel(sample, locale),
      count,
    }));

  const byMonthCat = new Map<string, Map<string, number>>();
  for (const r of readings) {
    const mk = monthKey(r.createdAt);
    const cat = isReadingCategory(r.category) ? r.category : "general";
    if (!byMonthCat.has(mk)) byMonthCat.set(mk, new Map());
    const m = byMonthCat.get(mk)!;
    m.set(cat, (m.get(cat) ?? 0) + 1);
  }

  const dominantCategoryByMonth: CategoryMonthRow[] = [...byMonthCat.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([mk, catMap]) => {
      let best: ReadingCategory | "general" = "general";
      let bestCount = 0;
      for (const [c, n] of catMap.entries()) {
        if (n > bestCount) {
          bestCount = n;
          best = isReadingCategory(c) ? c : "general";
        }
      }
      const sample =
        readings.find((r) => monthKey(r.createdAt) === mk)?.createdAt ??
        new Date();
      return {
        monthKey: mk,
        monthLabel: monthLabel(sample, locale),
        category: best,
        count: bestCount,
      };
    });

  const questionThemes = countQuestionThemes(readings.map((r) => r.question));

  return {
    totalReadings: readings.length,
    favoriteCount,
    readingsThisMonth,
    topCategory: topCat,
    topHexagram,
    topHexagrams,
    monthlyVolume,
    dominantCategoryByMonth,
    categoryTotals,
    questionThemes,
    revision,
  };
}
