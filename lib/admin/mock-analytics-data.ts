/**
 * Mock analytics data for the admin dashboard UI.
 * Replace with PostHog / first-party queries when wiring live data.
 */

export type MetricTrend = "up" | "down" | "neutral";

export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  change: number;
  trend: MetricTrend;
  sparkline: number[];
};

export type TimeSeriesPoint = { day: string; value: number };

export type CategoryPoint = { name: string; value: number };

export type FunnelStep = { step: string; value: number; fill?: string };

export type InsightItem = {
  id: string;
  type: "trend" | "anomaly" | "growth";
  title: string;
  body: string;
  severity: "info" | "warning" | "positive";
};

export type BehaviorRow = { label: string; value: number; change?: number };

export type ErrorLogRow = {
  id: string;
  time: string;
  type: string;
  message: string;
  status?: number;
  durationMs?: number;
};

export type MockAnalyticsDashboard = {
  overview: {
    metrics: DashboardMetric[];
    dailyReadings: TimeSeriesPoint[];
    userGrowth: TimeSeriesPoint[];
  };
  readings: {
    categories: CategoryPoint[];
    completionRate: number;
    followUpRate: number;
    avgResponseSec: number;
  };
  revenue: {
    mrr: number;
    activeSubscribers: number;
    conversionFunnel: FunnelStep[];
    freeVsPaid: { free: number; paid: number };
  };
  users: {
    growth: TimeSeriesPoint[];
    total: number;
    newThisMonth: number;
  };
  retention: {
    d1: number;
    d7: number;
    d30: number;
    cohort: Array<{ week: string; retained: number }>;
  };
  behavior: {
    topButtons: BehaviorRow[];
    topPages: BehaviorRow[];
    dropOffs: BehaviorRow[];
  };
  devices: Array<{ name: string; value: number }>;
  insights: InsightItem[];
  errors: {
    api: ErrorLogRow[];
    readings: ErrorLogRow[];
    payments: ErrorLogRow[];
    slow: ErrorLogRow[];
  };
};

function last30Days(): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    points.push({
      day: d.toISOString().slice(5, 10),
      value: Math.floor(40 + Math.random() * 80 + (29 - i) * 1.2),
    });
  }
  return points;
}

function sparkline(seed: number): number[] {
  return Array.from({ length: 14 }, (_, i) =>
    Math.round(seed + Math.sin(i * 0.8) * 8 + i * 1.5),
  );
}

export function getMockAnalyticsDashboard(): MockAnalyticsDashboard {
  const dailyReadings = last30Days();
  const userGrowth = last30Days().map((p, i) => ({
    day: p.day,
    value: Math.floor(120 + i * 3 + Math.random() * 15),
  }));

  return {
    overview: {
      metrics: [
        {
          id: "dau",
          label: "Daily Active Users",
          value: "1,284",
          change: 12.4,
          trend: "up",
          sparkline: sparkline(90),
        },
        {
          id: "readings",
          label: "Total Readings",
          value: "18,492",
          change: 8.2,
          trend: "up",
          sparkline: sparkline(120),
        },
        {
          id: "session",
          label: "Avg Session Time",
          value: "6m 42s",
          change: -2.1,
          trend: "down",
          sparkline: sparkline(70),
        },
        {
          id: "conversion",
          label: "Conversion Rate",
          value: "4.8%",
          change: 0.6,
          trend: "up",
          sparkline: sparkline(45),
        },
        {
          id: "subscribers",
          label: "Active Subscribers",
          value: "342",
          change: 5.3,
          trend: "up",
          sparkline: sparkline(55),
        },
        {
          id: "revenue",
          label: "Revenue (MRR)",
          value: "€3,418",
          change: 5.3,
          trend: "up",
          sparkline: sparkline(60),
        },
      ],
      dailyReadings,
      userGrowth,
    },
    readings: {
      categories: [
        { name: "Love", value: 420 },
        { name: "Career", value: 310 },
        { name: "Life", value: 280 },
        { name: "Spirituality", value: 190 },
        { name: "Finance", value: 150 },
        { name: "Relationships", value: 130 },
      ],
      completionRate: 78.4,
      followUpRate: 24.6,
      avgResponseSec: 3.2,
    },
    revenue: {
      mrr: 3418,
      activeSubscribers: 342,
      conversionFunnel: [
        { step: "Landing", value: 10000, fill: "#c5a059" },
        { step: "Start reading", value: 4200, fill: "#a78bfa" },
        { step: "Complete reading", value: 2800, fill: "#7c3aed" },
        { step: "Save reading", value: 890, fill: "#6366f1" },
        { step: "Subscribe", value: 164, fill: "#4f46e5" },
      ],
      freeVsPaid: { free: 8940, paid: 342 },
    },
    users: {
      growth: userGrowth,
      total: 8940,
      newThisMonth: 412,
    },
    retention: {
      d1: 42,
      d7: 28,
      d30: 16,
      cohort: [
        { week: "W1", retained: 100 },
        { week: "W2", retained: 68 },
        { week: "W3", retained: 52 },
        { week: "W4", retained: 41 },
        { week: "W5", retained: 34 },
        { week: "W6", retained: 28 },
      ],
    },
    behavior: {
      topButtons: [
        { label: "Start Your Reading", value: 3840, change: 14 },
        { label: "Save Reading", value: 1920, change: 8 },
        { label: "Ask Follow-up", value: 890, change: 22 },
        { label: "Upgrade to Premium", value: 640, change: -3 },
        { label: "Share Reading", value: 410, change: 11 },
      ],
      topPages: [
        { label: "/reading/guided", value: 5200 },
        { label: "/dashboard", value: 4100 },
        { label: "/", value: 3800 },
        { label: "/pricing", value: 2100 },
        { label: "/hexagrams", value: 1800 },
      ],
      dropOffs: [
        { label: "Hero → Category", value: 18 },
        { label: "Category → Question", value: 12 },
        { label: "Question → Ritual", value: 24 },
        { label: "Ritual → Reading reveal", value: 8 },
        { label: "Reading → Save", value: 42 },
      ],
    },
    devices: [
      { name: "Mobile", value: 58 },
      { name: "Desktop", value: 34 },
      { name: "Tablet", value: 8 },
    ],
    insights: [
      {
        id: "1",
        type: "trend",
        title: "Love readings retain users 2.3× longer",
        body: "Users who complete a Love category reading return within 7 days at nearly double the baseline rate.",
        severity: "positive",
      },
      {
        id: "2",
        type: "anomaly",
        title: "Mobile users abandon onboarding 38% more often",
        body: "Drop-off spikes between category selection and question submit on viewports under 640px.",
        severity: "warning",
      },
      {
        id: "3",
        type: "growth",
        title: "Users who save readings convert better",
        body: "Saved readings correlate with a 3.1× higher Premium conversion within 14 days.",
        severity: "info",
      },
      {
        id: "4",
        type: "trend",
        title: "Follow-up questions predict retention",
        body: "28% of week-two retained users asked at least one follow-up in oracle chat.",
        severity: "info",
      },
    ],
    errors: {
      api: [
        {
          id: "e1",
          time: "2m ago",
          type: "API",
          message: "POST /api/interpret — upstream timeout",
          status: 504,
          durationMs: 30012,
        },
        {
          id: "e2",
          time: "18m ago",
          type: "API",
          message: "POST /api/readings/guided — insufficient credits",
          status: 403,
        },
        {
          id: "e3",
          time: "1h ago",
          type: "API",
          message: "GET /api/credits/balance — rate limited",
          status: 429,
        },
      ],
      readings: [
        {
          id: "r1",
          time: "5m ago",
          type: "AI",
          message: "DeepSeek interpretation stream aborted",
          durationMs: 18500,
        },
        {
          id: "r2",
          time: "42m ago",
          type: "AI",
          message: "Hexagram generation failed — invalid line values",
        },
      ],
      payments: [
        {
          id: "p1",
          time: "3h ago",
          type: "Stripe",
          message: "invoice.payment_failed — card declined",
          status: 402,
        },
      ],
      slow: [
        {
          id: "s1",
          time: "8m ago",
          type: "Slow",
          message: "POST /api/readings/guided",
          durationMs: 4820,
        },
        {
          id: "s2",
          time: "25m ago",
          type: "Slow",
          message: "POST /api/interpret",
          durationMs: 6100,
        },
      ],
    },
  };
}
