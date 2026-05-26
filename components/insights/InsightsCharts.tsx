"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getCategoryLabel } from "@/lib/readings/category";
import { isReadingCategory } from "@/lib/readings/category";
import type { ReadingInsightAnalytics } from "@/types/insights";

type InsightsChartsProps = {
  analytics: ReadingInsightAnalytics;
  blurred?: boolean;
};

const TOOLTIP_STYLE = {
  backgroundColor: "rgba(18, 20, 28, 0.95)",
  border: "1px solid rgba(197, 160, 89, 0.25)",
  borderRadius: "8px",
  fontSize: "12px",
};

export function InsightsCharts({
  analytics,
  blurred = false,
}: InsightsChartsProps) {
  const categoryChartData = analytics.dominantCategoryByMonth.map((row) => ({
    month: row.monthLabel,
    count: row.count,
    category: isReadingCategory(row.category)
      ? getCategoryLabel(row.category)
      : row.category,
  }));

  const volumeData = analytics.monthlyVolume;

  return (
    <div
      className={`grid gap-6 lg:grid-cols-2 ${blurred ? "pointer-events-none select-none blur-md" : ""}`}
    >
      <div className="rounded-2xl border border-white/10 bg-zen-surface/60 p-5 backdrop-blur-xl">
        <h3 className="text-xs font-medium uppercase tracking-widest text-zen-muted">
          Reading frequency
        </h3>
        <div className="mt-4 h-56 w-full">
          {volumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#8b8d94", fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fill: "#8b8d94", fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar
                  dataKey="count"
                  fill="rgba(197, 160, 89, 0.75)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-zen-muted">
              Not enough data yet
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zen-surface/60 p-5 backdrop-blur-xl">
        <h3 className="text-xs font-medium uppercase tracking-widest text-zen-muted">
          Dominant focus by month
        </h3>
        <div className="mt-4 h-56 w-full">
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#8b8d94", fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fill: "#8b8d94", fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value, _name, props) => {
                    const p = props.payload as { category?: string };
                    return [`${value} readings`, p.category ?? "Category"];
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="rgba(124, 58, 237, 0.65)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-zen-muted">
              Not enough data yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
