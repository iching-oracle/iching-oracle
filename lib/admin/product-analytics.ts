import "server-only";

import { prisma } from "@/lib/prisma";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { PREMIUM_PRICE_CENTS } from "@/lib/stripe";
import { generateProductInsights } from "@/lib/admin/analytics-insights";

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

async function countDistinctUsers(since: Date): Promise<number> {
  const rows = await prisma.productAnalyticsEvent.groupBy({
    by: ["userId"],
    where: {
      createdAt: { gte: since },
      userId: { not: null },
    },
  });
  return rows.length;
}

async function countEvents(event: string, since: Date): Promise<number> {
  return prisma.productAnalyticsEvent.count({
    where: { event, createdAt: { gte: since } },
  });
}

async function eventsByDay(since: Date) {
  const rows = await prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
    SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::bigint AS count
    FROM "ProductAnalyticsEvent"
    WHERE "createdAt" >= ${since}
    GROUP BY 1
    ORDER BY 1 ASC
  `;
  return rows.map((r) => ({
    day: r.day.toISOString().slice(0, 10),
    count: Number(r.count),
  }));
}

export async function getProductAnalyticsDashboard() {
  const now = new Date();
  const since30 = daysAgo(30);
  const since7 = daysAgo(7);
  const since1 = daysAgo(1);

  const [
    totalUsers,
    premiumUsers,
    totalReadings,
    readings30d,
    dau,
    wau,
    mau,
    readingsGenerated30d,
    readingsCompleted30d,
    onboardingStarted30d,
    questionSubmitted30d,
    paywallViewed30d,
    checkoutInitiated30d,
    subscriptionsStarted30d,
    aiFailures30d,
    paymentFailures30d,
    apiErrors30d,
    recentErrors,
    deviceBreakdown,
    topPages,
    topButtons,
    funnelReading,
    funnelSignup,
    retention,
    avgResponseTime,
  ] = await Promise.all([
    prisma.user.count(),
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
    countEvents(ANALYTICS_EVENTS.ONBOARDING_STARTED, since30),
    countEvents(ANALYTICS_EVENTS.QUESTION_SUBMITTED, since30),
    countEvents(ANALYTICS_EVENTS.PAYWALL_VIEWED, since30),
    countEvents(ANALYTICS_EVENTS.CHECKOUT_INITIATED, since30),
    countEvents(ANALYTICS_EVENTS.SUBSCRIPTION_STARTED, since30),
    countEvents(ANALYTICS_EVENTS.AI_GENERATION_FAILED, since30),
    countEvents(ANALYTICS_EVENTS.PAYMENT_FAILED, since30),
    countEvents(ANALYTICS_EVENTS.API_ERROR, since30),
    prisma.systemEvent.count({
      where: { level: "error", createdAt: { gte: since30 } },
    }),
    prisma.$queryRaw<Array<{ device: string; count: bigint }>>`
      SELECT COALESCE(properties->>'device_type', 'unknown') AS device,
             COUNT(*)::bigint AS count
      FROM "ProductAnalyticsEvent"
      WHERE "createdAt" >= ${since30}
      GROUP BY 1
      ORDER BY count DESC
    `,
    prisma.$queryRaw<Array<{ path: string; count: bigint }>>`
      SELECT COALESCE(properties->>'page_path', '/') AS path,
             COUNT(*)::bigint AS count
      FROM "ProductAnalyticsEvent"
      WHERE event = ${ANALYTICS_EVENTS.PAGE_VIEWED}
        AND "createdAt" >= ${since30}
      GROUP BY 1
      ORDER BY count DESC
      LIMIT 10
    `,
    prisma.$queryRaw<Array<{ button: string; count: bigint }>>`
      SELECT COALESCE(properties->>'button_id', properties->>'cta_id', 'unknown') AS button,
             COUNT(*)::bigint AS count
      FROM "ProductAnalyticsEvent"
      WHERE event IN (${ANALYTICS_EVENTS.BUTTON_CLICKED}, ${ANALYTICS_EVENTS.CTA_CLICKED})
        AND "createdAt" >= ${since30}
      GROUP BY 1
      ORDER BY count DESC
      LIMIT 10
    `,
    getFunnelCounts("reading_conversion", since30),
    getFunnelCounts("signup_retention", since30),
    getRetentionCohorts(),
    getAvgResponseTime(since30),
  ]);

  const categoryCounts = await prisma.$queryRaw<
    Array<{ category: string; count: bigint }>
  >`
    SELECT COALESCE(properties->>'category', 'unknown') AS category,
           COUNT(*)::bigint AS count
    FROM "ProductAnalyticsEvent"
    WHERE event = ${ANALYTICS_EVENTS.CATEGORY_SELECTED}
      AND "createdAt" >= ${since30}
    GROUP BY 1
    ORDER BY count DESC
  `;

  const eventsPerDay = await eventsByDay(since30);
  const readingsPerDay = await prisma.$queryRaw<
    Array<{ day: Date; count: bigint }>
  >`
    SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::bigint AS count
    FROM "Reading"
    WHERE "createdAt" >= ${since30}
    GROUP BY 1
    ORDER BY 1 ASC
  `;

  const conversionRate =
    totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;

  const readingCompletionRate =
    readingsGenerated30d > 0
      ? (readingsCompleted30d / readingsGenerated30d) * 100
      : 0;

  const mrr = premiumUsers * (PREMIUM_PRICE_CENTS / 100);

  const insights = generateProductInsights({
    categoryCounts: categoryCounts.map((c) => ({
      category: c.category,
      count: Number(c.count),
    })),
    deviceBreakdown: deviceBreakdown.map((d) => ({
      device: d.device,
      count: Number(d.count),
    })),
    funnelReading,
    funnelSignup,
    retention,
    readingCompletionRate,
    conversionRate,
    onboardingStarted30d,
    questionSubmitted30d,
  });

  return {
    overview: {
      dau,
      wau,
      mau,
      totalReadings,
      readings30d,
      conversionRate,
      retentionD7: retention.d7,
      avgResponseTimeMs: avgResponseTime,
    },
    revenue: {
      mrr,
      activeSubscribers: premiumUsers,
      freeUsers: totalUsers - premiumUsers,
      paidRatio: conversionRate,
      checkoutInitiated30d,
      subscriptionsStarted30d,
      churnEvents30d: await countEvents(
        ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED,
        since30,
      ),
    },
    readings: {
      generated30d: readingsGenerated30d,
      completed30d: readingsCompleted30d,
      completionRate: readingCompletionRate,
      categoryCounts: categoryCounts.map((c) => ({
        category: c.category,
        count: Number(c.count),
      })),
      followUpRate:
        readingsCompleted30d > 0
          ? (
              (await countEvents(
                ANALYTICS_EVENTS.FOLLOWUP_QUESTION_ASKED,
                since30,
              )) /
              readingsCompleted30d
            ) * 100
          : 0,
      avgResponseTimeMs: avgResponseTime,
    },
    behavior: {
      funnelReading,
      funnelSignup,
      topPages: topPages.map((p) => ({
        path: p.path,
        count: Number(p.count),
      })),
      topButtons: topButtons.map((b) => ({
        button: b.button,
        count: Number(b.count),
      })),
      deviceBreakdown: deviceBreakdown.map((d) => ({
        device: d.device,
        count: Number(d.count),
      })),
    },
    errors: {
      aiFailures30d,
      paymentFailures30d,
      apiErrors30d,
      systemErrors30d: recentErrors,
    },
    charts: {
      eventsPerDay,
      readingsPerDay: readingsPerDay.map((r) => ({
        day: r.day.toISOString().slice(0, 10),
        count: Number(r.count),
      })),
    },
    insights,
  };
}

async function getFunnelCounts(funnel: string, since: Date) {
  const rows = await prisma.$queryRaw<
    Array<{ step: string; count: bigint }>
  >`
    SELECT COALESCE(properties->>'funnel_step', 'unknown') AS step,
           COUNT(DISTINCT COALESCE("sessionId", "distinctId", "id"))::bigint AS count
    FROM "ProductAnalyticsEvent"
    WHERE funnel = ${funnel}
      AND "createdAt" >= ${since}
    GROUP BY 1
    ORDER BY count DESC
  `;
  return rows.map((r) => ({ step: r.step, count: Number(r.count) }));
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

async function getRetentionCohorts() {
  const d1 = daysAgo(1);
  const d7 = daysAgo(7);
  const d30 = daysAgo(30);

  async function retentionSince(since: Date) {
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
    d1: await retentionSince(d1),
    d7: await retentionSince(d7),
    d30: await retentionSince(d30),
  };
}
