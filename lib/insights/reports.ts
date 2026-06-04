import "server-only";

import { generatePeriodReport } from "@/lib/insights/generate";
import { getInsightPeriodKey } from "@/lib/insights/period-keys";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  InsightPeriodReport,
  InsightReportType,
  ReadingInsightAnalytics,
} from "@/types/insights";

const WEEKLY_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MONTHLY_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function ttlFor(type: InsightReportType): number {
  return type === "weekly" ? WEEKLY_TTL_MS : MONTHLY_TTL_MS;
}

function parseReportPayload(raw: Prisma.JsonValue): InsightPeriodReport | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.body !== "string" || typeof o.headline !== "string") return null;
  return {
    periodLabel: String(o.periodLabel ?? ""),
    headline: o.headline,
    body: o.body,
    highlights: Array.isArray(o.highlights) ? o.highlights.map(String) : [],
    gentlePrompts: Array.isArray(o.gentlePrompts)
      ? o.gentlePrompts.map(String)
      : [],
  };
}

export async function getOrCreatePeriodReport(
  userId: string,
  reportType: InsightReportType,
  analytics: ReadingInsightAnalytics,
  readings: { question: string }[],
  language: string,
  options?: { forceRefresh?: boolean },
): Promise<InsightPeriodReport | null> {
  const minReadings = reportType === "weekly" ? 2 : 4;
  if (analytics.totalReadings < minReadings) return null;

  const { periodKey, periodLabel } = getInsightPeriodKey(reportType);

  if (!options?.forceRefresh) {
    const cached = await prisma.insightReportCache.findUnique({
      where: {
        userId_reportType_periodKey: {
          userId,
          reportType,
          periodKey,
        },
      },
    });

    if (
      cached &&
      cached.revision === analytics.revision &&
      Date.now() - cached.generatedAt.getTime() < ttlFor(reportType)
    ) {
      const parsed = parseReportPayload(cached.payload);
      if (parsed) return parsed;
    }
  }

  const report = await generatePeriodReport(
    reportType,
    analytics,
    readings,
    language,
    periodLabel,
  );

  await prisma.insightReportCache.upsert({
    where: {
      userId_reportType_periodKey: {
        userId,
        reportType,
        periodKey,
      },
    },
    create: {
      userId,
      reportType,
      periodKey,
      revision: analytics.revision,
      payload: report as Prisma.InputJsonValue,
    },
    update: {
      revision: analytics.revision,
      payload: report as Prisma.InputJsonValue,
      generatedAt: new Date(),
    },
  });

  return report;
}

export async function invalidateInsightReports(userId: string): Promise<void> {
  try {
    await prisma.insightReportCache.deleteMany({ where: { userId } });
  } catch {
    /* non-critical */
  }
}
