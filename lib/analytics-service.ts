import "server-only";

import { unstable_cache } from "next/cache";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { generateProductInsights } from "@/lib/admin/analytics-insights";
import type {
  AnalyticsDashboardData,
  BehaviorRow,
  DashboardMetric,
  ErrorLogRow,
  FunnelStep,
  TimeSeriesPoint,
} from "@/lib/admin/analytics-dashboard-types";
import { fetchDatabaseAnalyticsSnapshot } from "@/lib/admin/analytics-db";
import {
  avgProperty,
  countActiveUsers,
  countEvents,
  eventSeries,
  groupByProperty,
  groupByPropertyAllEvents,
  isPostHogQueryConfigured,
  recentErrorEvents,
  runHogQLQuery,
} from "@/lib/posthog-server";

const FUNNEL_COLORS = [
  "#c5a059",
  "#a78bfa",
  "#7c3aed",
  "#6366f1",
  "#4f46e5",
  "#4338ca",
];

const CONVERSION_FUNNEL: Array<{ step: string; event: string }> = [
  { step: "Landing", event: ANALYTICS_EVENTS.PAGE_VIEWED },
  { step: "Onboarding", event: ANALYTICS_EVENTS.ONBOARDING_STARTED },
  { step: "Question", event: ANALYTICS_EVENTS.QUESTION_SUBMITTED },
  { step: "Complete", event: ANALYTICS_EVENTS.READING_COMPLETED },
  { step: "Follow-up", event: ANALYTICS_EVENTS.FOLLOWUP_QUESTION_ASKED },
  { step: "Subscribe", event: ANALYTICS_EVENTS.PAYMENT_COMPLETED },
];

/**
 * Fetch live admin dashboard analytics (PostHog + DB fallbacks).
 */
export async function getAnalyticsDashboardData(): Promise<AnalyticsDashboardData> {
  return getCachedAnalyticsDashboard();
}

const getCachedAnalyticsDashboard = unstable_cache(
  async () => buildAnalyticsDashboard(),
  ["admin-analytics-dashboard-v1"],
  { revalidate: 300, tags: ["admin-analytics"] },
);

async function buildAnalyticsDashboard(): Promise<AnalyticsDashboardData> {
  const postHogEnabled = isPostHogQueryConfigured();
  const db = await fetchDatabaseAnalyticsSnapshot();

  let ph: PostHogSnapshot | null = null;
  if (postHogEnabled) {
    try {
      ph = await fetchPostHogSnapshot();
    } catch (err) {
      console.error("[analytics-service] PostHog fetch failed, using DB fallback", err);
    }
  }

  const source: AnalyticsDashboardData["meta"]["source"] = ph
    ? db.hasEvents
      ? "mixed"
      : "posthog"
    : "database";

  const dau = ph?.dau ?? db.dau;
  const wau = ph?.wau ?? db.wau;
  const mau = ph?.mau ?? db.mau;
  const readingsGenerated = ph?.readingsGenerated30d ?? db.readingsGenerated30d;
  const readingsCompleted = ph?.readingsCompleted30d ?? db.readingsCompleted30d;
  const totalReadings = ph?.totalReadings ?? db.totalReadings;
  const completionRate =
    readingsGenerated > 0 ? (readingsCompleted / readingsGenerated) * 100 : 0;
  const followUpRate =
    readingsCompleted > 0
      ? ((ph?.followUps30d ?? db.followUps30d) / readingsCompleted) * 100
      : 0;
  const conversionRate = db.conversionRate;
  const avgResponseMs = ph?.avgResponseMs ?? db.avgResponseTimeMs;
  const avgSessionSec = ph?.avgSessionSec ?? 0;

  const dailyReadings =
    ph?.dailyReadings.length ? ph.dailyReadings : db.readingsPerDay;
  const userGrowth =
    ph?.userSignups.length ? ph.userSignups : db.userSignupsPerDay;

  const categories =
    ph?.categories.length ? ph.categories : db.categoryCounts;
  const devices = ph?.devices.length ? ph.devices : db.deviceBreakdown;
  const topPages = ph?.topPages.length ? ph.topPages : db.topPages;
  const topButtons = ph?.topButtons.length ? ph.topButtons : db.topButtons;
  const trafficSources = ph?.trafficSources ?? [];

  const funnelCounts = ph?.funnelCounts ?? buildFunnelFromDb(db);
  const dropOffs = computeDropOffs(funnelCounts);

  const retention = ph?.retention ?? db.retention;
  const cohort = ph?.retentionCohort ?? db.retentionCohort;

  const insights = generateProductInsights({
    categoryCounts: categories,
    deviceBreakdown: devices.map((d) => ({
      device: d.name,
      count: d.value,
    })),
    funnelReading: funnelCounts.map((f) => ({
      step: f.step,
      count: f.value,
    })),
    funnelSignup: [],
    retention,
    readingCompletionRate: completionRate,
    conversionRate,
    onboardingStarted30d: funnelCounts[1]?.value ?? 0,
    questionSubmitted30d: funnelCounts[2]?.value ?? 0,
  });

  const errors = await buildErrorSection(ph, db);

  return {
    meta: {
      source,
      fetchedAt: new Date().toISOString(),
      postHogEnabled,
    },
    overview: {
      metrics: buildOverviewMetrics({
        dau,
        totalReadings,
        avgSessionSec,
        conversionRate,
        activeSubscribers: db.activeSubscribers,
        mrr: db.mrr,
        dailyReadings,
        userGrowth,
      }),
      dailyReadings: fillSeries(dailyReadings, 30),
      userGrowth: fillSeries(userGrowth, 30),
    },
    readings: {
      categories: categories.map((c) => ({
        name: capitalize(c.category),
        value: c.count,
      })),
      completionRate: round1(completionRate),
      followUpRate: round1(followUpRate),
      avgResponseSec: round1(avgResponseMs / 1000) || 0,
    },
    revenue: {
      mrr: db.mrr,
      activeSubscribers: db.activeSubscribers,
      conversionFunnel: funnelCounts,
      freeVsPaid: {
        free: Math.max(0, db.totalUsers - db.activeSubscribers),
        paid: db.activeSubscribers,
      },
    },
    users: {
      growth: fillSeries(userGrowth, 30),
      total: db.totalUsers,
      newThisMonth: db.newUsers30d,
    },
    retention: {
      d1: round1(retention.d1),
      d7: round1(retention.d7),
      d30: round1(retention.d30),
      cohort,
    },
    behavior: {
      topButtons: topButtons.map((b) => ({
        label: formatLabel(b.label),
        value: b.count,
      })),
      topPages: [
        ...topPages.map((p) => ({ label: p.label, value: p.count })),
        ...trafficSources.slice(0, 3).map((t) => ({
          label: `Traffic: ${t.label}`,
          value: t.count,
        })),
      ].slice(0, 10),
      dropOffs,
    },
    devices: normalizeDevicePercents(devices),
    insights,
    errors,
  };
}

type PostHogSnapshot = {
  dau: number;
  wau: number;
  mau: number;
  totalReadings: number;
  readingsGenerated30d: number;
  readingsCompleted30d: number;
  followUps30d: number;
  avgResponseMs: number;
  avgSessionSec: number;
  dailyReadings: TimeSeriesPoint[];
  userSignups: TimeSeriesPoint[];
  categories: Array<{ category: string; count: number }>;
  devices: Array<{ name: string; value: number }>;
  topPages: Array<{ label: string; count: number }>;
  topButtons: Array<{ label: string; count: number }>;
  trafficSources: Array<{ label: string; count: number }>;
  funnelCounts: FunnelStep[];
  retention: { d1: number; d7: number; d30: number };
  retentionCohort: Array<{ week: string; retained: number }>;
};

async function fetchPostHogSnapshot(): Promise<PostHogSnapshot> {
  const [
    dau,
    wau,
    mau,
    readingsGenerated30d,
    readingsCompleted30d,
    followUps30d,
    totalReadings,
    dailyReadings,
    userSignups,
    categoriesRaw,
    devicesRaw,
    topPagesRaw,
    topButtonsRaw,
    trafficRaw,
    avgResponseMs,
    funnelSteps,
    retention,
    retentionCohort,
  ] = await Promise.all([
    countActiveUsers(1),
    countActiveUsers(7),
    countActiveUsers(30),
    countEvents(ANALYTICS_EVENTS.READING_GENERATED, 30),
    countEvents(ANALYTICS_EVENTS.READING_COMPLETED, 30),
    countEvents(ANALYTICS_EVENTS.FOLLOWUP_QUESTION_ASKED, 30),
    countEvents(ANALYTICS_EVENTS.READING_GENERATED, 3650),
    eventSeries(ANALYTICS_EVENTS.READING_GENERATED, 30),
    eventSeries(ANALYTICS_EVENTS.USER_SIGNED_UP, 30),
    groupByProperty(ANALYTICS_EVENTS.CATEGORY_SELECTED, "category", 30, 8),
    groupByPropertyAllEvents("device_type", 30, 5),
    groupByProperty(ANALYTICS_EVENTS.PAGE_VIEWED, "page_path", 30, 10),
    groupByProperty(ANALYTICS_EVENTS.BUTTON_CLICKED, "button_id", 30, 8),
    groupByPropertyAllEvents("traffic_source", 30, 6),
    avgProperty(ANALYTICS_EVENTS.READING_GENERATED, "response_time_ms", 30),
    fetchFunnelCounts(),
    fetchRetentionRates(),
    fetchRetentionCohort(),
  ]);

  const avgSessionSec = await fetchAvgSessionSeconds();

  return {
    dau,
    wau,
    mau,
    totalReadings,
    readingsGenerated30d,
    readingsCompleted30d,
    followUps30d,
    avgResponseMs,
    avgSessionSec,
    dailyReadings,
    userSignups,
    categories: categoriesRaw.map((r) => ({
      category: r.key,
      count: r.count,
    })),
    devices: devicesRaw.map((r) => ({
      name: capitalize(r.key),
      value: r.count,
    })),
    topPages: topPagesRaw.map((r) => ({
      label: r.key,
      count: r.count,
    })),
    topButtons: topButtonsRaw.map((r) => ({
      label: r.key,
      count: r.count,
    })),
    trafficSources: trafficRaw.map((r) => ({
      label: r.key,
      count: r.count,
    })),
    funnelCounts: funnelSteps,
    retention,
    retentionCohort,
  };
}

async function fetchFunnelCounts(): Promise<FunnelStep[]> {
  const counts = await Promise.all(
    CONVERSION_FUNNEL.map((f) => countEvents(f.event, 30)),
  );
  return CONVERSION_FUNNEL.map((f, i) => ({
    step: f.step,
    value: counts[i] ?? 0,
    fill: FUNNEL_COLORS[i],
  }));
}

async function fetchAvgSessionSeconds(): Promise<number> {
  try {
    const sql = `
      SELECT avg(toFloat(properties.$session_duration)) AS a
      FROM events
      WHERE timestamp >= now() - INTERVAL 30 DAY
        AND properties.$session_duration IS NOT NULL
    `;
    const { results } = await runHogQLQuery(sql, { name: "avg_session" });
    const raw = Number(results[0]?.[0] ?? 0);
    return raw > 1000 ? raw / 1000 : raw;
  } catch {
    return 0;
  }
}

async function fetchRetentionRates(): Promise<{
  d1: number;
  d7: number;
  d30: number;
}> {
  try {
    const sql = `
      SELECT
        countIf(days_since_signup <= 1 AND did_return) / nullIf(countIf(days_since_signup <= 1), 0) * 100 AS d1,
        countIf(days_since_signup <= 7 AND did_return) / nullIf(countIf(days_since_signup <= 7), 0) * 100 AS d7,
        countIf(days_since_signup <= 30 AND did_return) / nullIf(countIf(days_since_signup <= 30), 0) * 100 AS d30
      FROM (
        SELECT
          person_id,
          dateDiff('day', min(timestamp), now()) AS days_since_signup,
          max(if(event = '${ANALYTICS_EVENTS.READING_COMPLETED.replace(/'/g, "''")}', 1, 0)) AS did_return
        FROM events
        WHERE person_id IS NOT NULL
          AND timestamp >= now() - INTERVAL 60 DAY
        GROUP BY person_id
      )
    `;
    const { results } = await runHogQLQuery(sql, { name: "retention_rates" });
    return {
      d1: Number(results[0]?.[0] ?? 0),
      d7: Number(results[0]?.[1] ?? 0),
      d30: Number(results[0]?.[2] ?? 0),
    };
  } catch {
    return { d1: 0, d7: 0, d30: 0 };
  }
}

async function fetchRetentionCohort(): Promise<
  Array<{ week: string; retained: number }>
> {
  try {
    const sql = `
      SELECT toStartOfWeek(timestamp) AS w, uniq(person_id) AS u
      FROM events
      WHERE event = '${ANALYTICS_EVENTS.READING_COMPLETED.replace(/'/g, "''")}'
        AND timestamp >= now() - INTERVAL 42 DAY
      GROUP BY w
      ORDER BY w ASC
      LIMIT 6
    `;
    const { results } = await runHogQLQuery(sql, { name: "retention_cohort" });
    const max = Math.max(...results.map((r) => Number(r[1] ?? 0)), 1);
    return results.map((r, i) => ({
      week: `W${i + 1}`,
      retained: Math.round((Number(r[1] ?? 0) / max) * 100),
    }));
  } catch {
    return [];
  }
}

async function buildErrorSection(
  ph: PostHogSnapshot | null,
  db: Awaited<ReturnType<typeof fetchDatabaseAnalyticsSnapshot>>,
): Promise<AnalyticsDashboardData["errors"]> {
  const phErrors = ph
    ? await recentErrorEvents(
        [
          ANALYTICS_EVENTS.API_ERROR,
          ANALYTICS_EVENTS.AI_GENERATION_FAILED,
          ANALYTICS_EVENTS.PAYMENT_FAILED,
        ],
        15,
      ).catch(() => [])
    : [];

  const mapPhError = (rows: typeof phErrors, filter: string): ErrorLogRow[] =>
    rows
      .filter((r) => r.event === filter)
      .slice(0, 5)
      .map((r, i) => ({
        id: `ph-${filter}-${i}`,
        time: formatRelativeTime(r.timestamp),
        type: r.category ?? filter,
        message: r.endpoint
          ? `${r.endpoint}${r.status ? ` (${r.status})` : ""}`
          : filter,
        status: r.status,
        durationMs: r.durationMs,
      }));

  return {
    api:
      mapPhError(phErrors, ANALYTICS_EVENTS.API_ERROR).length > 0
        ? mapPhError(phErrors, ANALYTICS_EVENTS.API_ERROR)
        : db.errors.api,
    readings:
      mapPhError(phErrors, ANALYTICS_EVENTS.AI_GENERATION_FAILED).length > 0
        ? mapPhError(phErrors, ANALYTICS_EVENTS.AI_GENERATION_FAILED)
        : db.errors.readings,
    payments:
      mapPhError(phErrors, ANALYTICS_EVENTS.PAYMENT_FAILED).length > 0
        ? mapPhError(phErrors, ANALYTICS_EVENTS.PAYMENT_FAILED)
        : db.errors.payments,
    slow: db.errors.slow,
  };
}

function buildOverviewMetrics(input: {
  dau: number;
  totalReadings: number;
  avgSessionSec: number;
  conversionRate: number;
  activeSubscribers: number;
  mrr: number;
  dailyReadings: TimeSeriesPoint[];
  userGrowth: TimeSeriesPoint[];
}): DashboardMetric[] {
  const readingSpark = input.dailyReadings.map((p) => p.value);
  const userSpark = input.userGrowth.map((p) => p.value);

  return [
    metric("dau", "Daily Active Users", formatNum(input.dau), userSpark),
    metric(
      "readings",
      "Total Readings",
      formatNum(input.totalReadings),
      readingSpark,
    ),
    metric(
      "session",
      "Avg Session Time",
      input.avgSessionSec > 0
        ? formatDuration(input.avgSessionSec)
        : "—",
      userSpark,
    ),
    metric(
      "conversion",
      "Conversion Rate",
      `${round1(input.conversionRate)}%`,
      userSpark,
    ),
    metric(
      "subscribers",
      "Active Subscribers",
      formatNum(input.activeSubscribers),
      userSpark,
    ),
    metric("revenue", "Revenue (MRR)", `€${formatNum(input.mrr)}`, readingSpark),
  ];
}

function metric(
  id: string,
  label: string,
  value: string,
  sparkline: number[],
): DashboardMetric {
  const { change, trend } = computeTrend(sparkline);
  return { id, label, value, change, trend, sparkline };
}

function computeTrend(series: number[]): {
  change: number;
  trend: "up" | "down" | "neutral";
} {
  if (series.length < 4) return { change: 0, trend: "neutral" };
  const mid = Math.floor(series.length / 2);
  const recent = series.slice(mid).reduce((a, b) => a + b, 0);
  const prev = series.slice(0, mid).reduce((a, b) => a + b, 0);
  if (prev === 0) {
    return { change: recent > 0 ? 100 : 0, trend: recent > 0 ? "up" : "neutral" };
  }
  const pct = ((recent - prev) / prev) * 100;
  return {
    change: round1(pct),
    trend: pct > 1 ? "up" : pct < -1 ? "down" : "neutral",
  };
}

function buildFunnelFromDb(
  db: Awaited<ReturnType<typeof fetchDatabaseAnalyticsSnapshot>>,
): FunnelStep[] {
  const steps = [
    { step: "Landing", count: db.pageViews30d },
    { step: "Onboarding", count: db.onboardingStarted30d },
    { step: "Question", count: db.questionSubmitted30d },
    { step: "Complete", count: db.readingsCompleted30d },
    { step: "Follow-up", count: db.followUps30d },
    { step: "Subscribe", count: db.subscriptionsStarted30d },
  ];
  return steps.map((s, i) => ({
    step: s.step,
    value: s.count,
    fill: FUNNEL_COLORS[i],
  }));
}

function computeDropOffs(funnel: FunnelStep[]): BehaviorRow[] {
  const pairs: Array<{ label: string; from: number; to: number }> = [];
  for (let i = 0; i < funnel.length - 1; i++) {
    pairs.push({
      label: `${funnel[i]!.step} → ${funnel[i + 1]!.step}`,
      from: funnel[i]!.value,
      to: funnel[i + 1]!.value,
    });
  }
  return pairs.map((p) => {
    const drop =
      p.from > 0 ? Math.round(((p.from - p.to) / p.from) * 100) : 0;
    return { label: p.label, value: Math.max(0, drop) };
  });
}

function fillSeries(data: TimeSeriesPoint[], days: number): TimeSeriesPoint[] {
  if (data.length >= days) return data.slice(-days);
  const out = [...data];
  const now = new Date();
  while (out.length < days) {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - out.length));
    out.unshift({
      day: d.toISOString().slice(5, 10),
      value: 0,
    });
  }
  return out.slice(-days);
}

function normalizeDevicePercents(
  devices: Array<{ name: string; value: number }>,
): Array<{ name: string; value: number }> {
  const total = devices.reduce((s, d) => s + d.value, 0);
  if (total === 0) return devices;
  return devices.map((d) => ({
    name: d.name,
    value: Math.round((d.value / total) * 100),
  }));
}

function formatNum(n: number): string {
  return n.toLocaleString("en-US");
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}m ${s}s`;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

function formatLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatRelativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 48) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return "recent";
  }
}
