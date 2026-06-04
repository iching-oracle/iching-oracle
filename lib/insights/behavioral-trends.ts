import "server-only";

import { getCategoryLabel } from "@/lib/readings/category";
import { isReadingCategory } from "@/lib/readings/category";
import type { BehavioralTrend, MonthBucket } from "@/types/insights";

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function computeBehavioralTrends(
  monthlyVolume: MonthBucket[],
  readingsThisMonth: number,
  totalReadings: number,
  categoryTotals: Record<string, number>,
): BehavioralTrend[] {
  const trends: BehavioralTrend[] = [];

  if (monthlyVolume.length >= 2) {
    const recent = monthlyVolume.slice(-3);
    const counts = recent.map((m) => m.count);
    const last = counts[counts.length - 1] ?? 0;
    const prev = counts[counts.length - 2] ?? 0;
    const direction: BehavioralTrend["direction"] =
      last > prev + 1 ? "rising" : last < prev - 1 ? "softening" : "steady";
    trends.push({
      id: "consultation_cadence",
      label: "Consultation rhythm",
      direction,
      detail:
        direction === "rising"
          ? "Your journal activity has picked up recently — a season of active inquiry."
          : direction === "softening"
            ? "Fewer entries lately — space between questions can be its own wisdom."
            : "A steady pace of reflection across recent months.",
    });
  }

  if (readingsThisMonth > 0 && totalReadings > 0) {
    const share = Math.round((readingsThisMonth / totalReadings) * 100);
    if (share >= 40) {
      trends.push({
        id: "recent_focus",
        label: "Present-moment focus",
        direction: "rising",
        detail: `A large share of your journal (${share}%) lives in the last thirty days.`,
      });
    }
  }

  const sortedCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  if (sortedCats.length >= 2) {
    const [topId, topCount] = sortedCats[0]!;
    const [secondId, secondCount] = sortedCats[1]!;
    const gap = topCount - secondCount;
    if (gap <= 1) {
      const a = isReadingCategory(topId) ? getCategoryLabel(topId) : topId;
      const b = isReadingCategory(secondId) ? getCategoryLabel(secondId) : secondId;
      trends.push({
        id: "theme_breadth",
        label: "Thematic breadth",
        direction: "steady",
        detail: `Attention spreads between ${a} and ${b} — many threads, one journey.`,
      });
    }
  }

  return trends.slice(0, 4);
}

export function computeSpiritualGrowthSignals(
  readings: Array<{ createdAt: Date; category: string; isFavorite: boolean }>,
  categoryTotals: Record<string, number>,
): import("@/types/insights").SpiritualGrowthSignals {
  const total = readings.length;
  const favorites = readings.filter((r) => r.isFavorite).length;
  const spiritualCount = categoryTotals.spiritual ?? 0;

  const recent = readings.filter((r) => {
    const d = new Date();
    d.setDate(d.getDate() - 60);
    return r.createdAt >= d;
  });
  const recentSpiritual = recent.filter((r) => r.category === "spiritual").length;

  let categoryShiftNote: string | null = null;
  if (recent.length >= 3 && recentSpiritual >= 2 && spiritualCount < total * 0.4) {
    categoryShiftNote =
      "Spiritual themes are surfacing more often in recent consultations.";
  }

  const favoriteRatio = total > 0 ? favorites / total : 0;
  const reflectionDepth: "early" | "developing" | "deepening" =
    total < 5
      ? "early"
      : favoriteRatio >= 0.2 || total >= 20
        ? "deepening"
        : "developing";

  const months = new Set(readings.map((r) => monthKey(r.createdAt)));
  const spanMonths = Math.max(1, months.size);
  const journalConsistency = Math.min(
    100,
    Math.round((total / spanMonths) * 12),
  );

  return {
    reflectionDepth,
    categoryShiftNote,
    journalConsistency,
  };
}
