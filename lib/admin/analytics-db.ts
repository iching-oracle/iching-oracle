import "server-only";

import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { PREMIUM_PRICE_CENTS } from "@/lib/stripe";
import type { ErrorLogRow } from "@/lib/admin/analytics-dashboard-types";
import { prisma } from "@/lib/prisma";

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

export type DatabaseAnalyticsSnapshot = {
  hasEvents: boolean;
  dau: number;
  wau: number;
  mau: number;
  totalUsers: number;
  newUsers30d: number;
  totalReadings: number;
  readingsGenerated30d: number;
  readingsCompleted30d: number;
  followUps30d: number;
  pageViews30d: number;
  onboardingStarted30d: number;
  questionSubmitted30d: number;
  subscriptionsStarted30d: number;
  conversionRate: number;
  activeSubscribers: number;
  mrr: number;
  avgResponseTimeMs: number;
  readingsPerDay: Array<{ day: string; value: number }>;
  userSignupsPerDay: Array<{ day: string; value: number }>;
  categoryCounts: Array<{ category: string; count: number }>;
  deviceBreakdown: Array<{ name: string; value: number }>;
  topPages: Array<{ label: string; count: number }>;
  topButtons: Array<{ label: string; count: number }>;
  retention: { d1: number; d7: number; d30: number };
  retentionCohort: Array<{ week: string; retained: number }>;
  errors: {
    api: ErrorLogRow[];
    readings: ErrorLogRow[];
    payments: ErrorLogRow[];
    slow: ErrorLogRow[];
  };
};

export async function fetchDatabaseAnalyticsSnapshot(): Promise<DatabaseAnalyticsSnapshot> {
  const now = new Date();
  const since30 = daysAgo(30);
  const since1 = daysAgo(1);
  const since7 = daysAgo(7);

  const eventCount = await prisma.productAnalyticsEvent.count();

  const [
    totalUsers,
    newUsers30d,
    premiumUsers,
    totalReadings,
    readings30d,
    dau,
    wau,
    mau,
    readingsGenerated30d,
    readingsCompleted30d,
    followUps30d,
    pageViews30d,
    onboardingStarted30d,
    questionSubmitted30d,
    subscriptionsStarted30d,
    avgResponseTimeMs,
    categoryCounts,
    deviceRows,
    topPages,
    topButtons,
    readingsPerDay,
    userSignupsPerDay,
    recentAnalyticsErrors,
    retention,
    retentionCohort,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since30 } } }),
    prisma.user.count({
      where: {
        OR: [
          { subscriptionStatus: "active" },
          { premiumUntil: { gt: now } },
        ],
      },
    }),
    prisma.reading.count(),
    prisma.reading.count({ where: { createdAt: { gte: since30 } } }),
    countDistinctUsers(since1),
    countDistinctUsers(since7),
    countDistinctUsers(since30),
    countEvents(ANALYTICS_EVENTS.READING_GENERATED, since30),
    countEvents(ANALYTICS_EVENTS.READING_COMPLETED, since30),
    countEvents(ANALYTICS_EVENTS.FOLLOWUP_QUESTION_ASKED, since30),
    countEvents(ANALYTICS_EVENTS.PAGE_VIEWED, since30),
    countEvents(ANALYTICS_EVENTS.ONBOARDING_STARTED, since30),
    countEvents(ANALYTICS_EVENTS.QUESTION_SUBMITTED, since30),
    countEvents(ANALYTICS_EVENTS.SUBSCRIPTION_STARTED, since30),
    getAvgResponseTime(since30),
    getCategoryCounts(since30),
    getDeviceBreakdown(since30),
    getTopPages(since30),
    getTopButtons(since30),
    getReadingsPerDay(since30),
    getUserSignupsPerDay(since30),
    getRecentErrorEvents(),
    getRetentionRates(),
    getRetentionCohortFromReadings(),
  ]);

  const conversionRate =
    totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;

  return {
    hasEvents: eventCount > 0,
    dau,
    wau,
    mau,
    totalUsers,
    newUsers30d,
    totalReadings,
    readingsGenerated30d,
    readingsCompleted30d,
    followUps30d,
    pageViews30d,
    onboardingStarted30d,
    questionSubmitted30d,
    subscriptionsStarted30d,
    conversionRate,
    activeSubscribers: premiumUsers,
    mrr: premiumUsers * (PREMIUM_PRICE_CENTS / 100),
    avgResponseTimeMs,
    readingsPerDay,
    userSignupsPerDay,
    categoryCounts,
    deviceBreakdown: deviceRows.map((d) => ({
      name: d.device.charAt(0).toUpperCase() + d.device.slice(1),
      value: d.count,
    })),
    topPages,
    topButtons,
    retention,
    retentionCohort,
    errors: recentAnalyticsErrors,
  };
}

async function countDistinctUsers(since: Date): Promise<number> {
  const rows = await prisma.productAnalyticsEvent.groupBy({
    by: ["userId"],
    where: { createdAt: { gte: since }, userId: { not: null } },
  });
  return rows.length;
}

async function countEvents(event: string, since: Date): Promise<number> {
  return prisma.productAnalyticsEvent.count({
    where: { event, createdAt: { gte: since } },
  });
}

async function getAvgResponseTime(since: Date): Promise<number> {
  const rows = await prisma.$queryRaw<Array<{ avg: number | null }>>`
    SELECT AVG((properties->>'response_time_ms')::float) AS avg
    FROM "ProductAnalyticsEvent"
    WHERE event = ${ANALYTICS_EVENTS.READING_GENERATED}
      AND "createdAt" >= ${since}
      AND properties->>'response_time_ms' IS NOT NULL
  `;
  return Math.round(rows[0]?.avg ?? 0);
}

async function getCategoryCounts(since: Date) {
  const rows = await prisma.$queryRaw<Array<{ category: string; count: bigint }>>`
    SELECT COALESCE(properties->>'category', 'unknown') AS category,
           COUNT(*)::bigint AS count
    FROM "ProductAnalyticsEvent"
    WHERE event = ${ANALYTICS_EVENTS.CATEGORY_SELECTED}
      AND "createdAt" >= ${since}
    GROUP BY 1
    ORDER BY count DESC
    LIMIT 8
  `;
  return rows.map((r) => ({
    category: r.category,
    count: Number(r.count),
  }));
}

async function getDeviceBreakdown(since: Date) {
  const rows = await prisma.$queryRaw<Array<{ device: string; count: bigint }>>`
    SELECT COALESCE(properties->>'device_type', 'unknown') AS device,
           COUNT(*)::bigint AS count
    FROM "ProductAnalyticsEvent"
    WHERE "createdAt" >= ${since}
    GROUP BY 1
    ORDER BY count DESC
  `;
  return rows.map((r) => ({
    device: r.device,
    count: Number(r.count),
  }));
}

async function getTopPages(since: Date) {
  const rows = await prisma.$queryRaw<Array<{ path: string; count: bigint }>>`
    SELECT COALESCE(properties->>'page_path', '/') AS path,
           COUNT(*)::bigint AS count
    FROM "ProductAnalyticsEvent"
    WHERE event = ${ANALYTICS_EVENTS.PAGE_VIEWED}
      AND "createdAt" >= ${since}
    GROUP BY 1
    ORDER BY count DESC
    LIMIT 10
  `;
  return rows.map((r) => ({ label: r.path, count: Number(r.count) }));
}

async function getTopButtons(since: Date) {
  const rows = await prisma.$queryRaw<Array<{ button: string; count: bigint }>>`
    SELECT COALESCE(properties->>'button_id', properties->>'cta_id', 'unknown') AS button,
           COUNT(*)::bigint AS count
    FROM "ProductAnalyticsEvent"
    WHERE event IN (${ANALYTICS_EVENTS.BUTTON_CLICKED}, ${ANALYTICS_EVENTS.CTA_CLICKED})
      AND "createdAt" >= ${since}
    GROUP BY 1
    ORDER BY count DESC
    LIMIT 10
  `;
  return rows.map((r) => ({ label: r.button, count: Number(r.count) }));
}

async function getReadingsPerDay(since: Date) {
  const rows = await prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
    SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::bigint AS count
    FROM "Reading"
    WHERE "createdAt" >= ${since}
    GROUP BY 1
    ORDER BY 1 ASC
  `;
  return rows.map((r) => ({
    day: r.day.toISOString().slice(5, 10),
    value: Number(r.count),
  }));
}

async function getUserSignupsPerDay(since: Date) {
  const rows = await prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
    SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::bigint AS count
    FROM "User"
    WHERE "createdAt" >= ${since}
    GROUP BY 1
    ORDER BY 1 ASC
  `;
  return rows.map((r) => ({
    day: r.day.toISOString().slice(5, 10),
    value: Number(r.count),
  }));
}

async function getRetentionRates() {
  async function rate(since: Date) {
    const signups = await prisma.user.count({
      where: { createdAt: { gte: since } },
    });
    if (signups === 0) return 0;
    const returned = await prisma.reading.groupBy({
      by: ["userId"],
      where: {
        user: { createdAt: { gte: since } },
        createdAt: { gte: since },
      },
    });
    return (returned.length / signups) * 100;
  }
  return {
    d1: await rate(daysAgo(1)),
    d7: await rate(daysAgo(7)),
    d30: await rate(daysAgo(30)),
  };
}

async function getRetentionCohortFromReadings() {
  const since = daysAgo(42);
  const rows = await prisma.$queryRaw<Array<{ week: Date; count: bigint }>>`
    SELECT DATE_TRUNC('week', "createdAt") AS week, COUNT(DISTINCT "userId")::bigint AS count
    FROM "Reading"
    WHERE "createdAt" >= ${since}
    GROUP BY 1
    ORDER BY 1 ASC
    LIMIT 6
  `;
  const max = Math.max(...rows.map((r) => Number(r.count)), 1);
  return rows.map((r, i) => ({
    week: `W${i + 1}`,
    retained: Math.round((Number(r.count) / max) * 100),
  }));
}

async function getRecentErrorEvents(): Promise<DatabaseAnalyticsSnapshot["errors"]> {
  const since = daysAgo(30);
  const rows = await prisma.productAnalyticsEvent.findMany({
    where: {
      event: {
        in: [
          ANALYTICS_EVENTS.API_ERROR,
          ANALYTICS_EVENTS.AI_GENERATION_FAILED,
          ANALYTICS_EVENTS.PAYMENT_FAILED,
        ],
      },
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      event: true,
      createdAt: true,
      properties: true,
    },
  });

  const slow = await prisma.productAnalyticsEvent.findMany({
    where: {
      event: ANALYTICS_EVENTS.READING_GENERATED,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, createdAt: true, properties: true },
  });

  const slowRows = slow
    .map((r) => {
      const props = r.properties as Record<string, unknown> | null;
      const ms = Number(props?.response_time_ms ?? 0);
      return { row: r, ms };
    })
    .filter((x) => x.ms >= 4000)
    .slice(0, 5);

  const fmt = (d: Date) => formatRelative(d);

  return {
    api: rows
      .filter((r) => r.event === ANALYTICS_EVENTS.API_ERROR)
      .slice(0, 5)
      .map(mapErrorRow),
    readings: rows
      .filter((r) => r.event === ANALYTICS_EVENTS.AI_GENERATION_FAILED)
      .slice(0, 5)
      .map(mapErrorRow),
    payments: rows
      .filter((r) => r.event === ANALYTICS_EVENTS.PAYMENT_FAILED)
      .slice(0, 5)
      .map(mapErrorRow),
    slow: slowRows.map(({ row, ms }) => ({
      id: row.id,
      time: fmt(row.createdAt),
      type: "Slow",
      message: String(
        (row.properties as Record<string, unknown>)?.endpoint ??
          "reading_generated",
      ),
      durationMs: ms,
    })),
  };

  function mapErrorRow(r: (typeof rows)[0]): ErrorLogRow {
    const props = (r.properties ?? {}) as Record<string, unknown>;
    return {
      id: r.id,
      time: fmt(r.createdAt),
      type: String(props.error_category ?? r.event),
      message: String(props.endpoint ?? r.event),
      status: props.status_code != null ? Number(props.status_code) : undefined,
      durationMs:
        props.response_time_ms != null
          ? Number(props.response_time_ms)
          : undefined,
    };
  }
}

function formatRelative(d: Date): string {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
