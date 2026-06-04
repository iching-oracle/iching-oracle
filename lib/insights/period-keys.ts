import "server-only";

import type { InsightReportType } from "@/types/insights";

export function getInsightPeriodKey(
  reportType: InsightReportType,
  now = new Date(),
): { periodKey: string; periodLabel: string } {
  if (reportType === "monthly") {
    const periodKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const periodLabel = new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(now);
    return { periodKey, periodLabel };
  }

  const start = new Date(now);
  const day = start.getDay();
  const diff = (day + 6) % 7;
  start.setDate(start.getDate() - diff);
  start.setHours(0, 0, 0, 0);

  const oneJan = new Date(start.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((start.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7,
  );
  const periodKey = `${start.getFullYear()}-W${String(week).padStart(2, "0")}`;
  const periodLabel = `Week of ${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(start)}`;
  return { periodKey, periodLabel };
}
