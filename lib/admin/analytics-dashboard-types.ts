/**
 * Admin analytics dashboard data contract (UI layer).
 * Populated by lib/analytics-service.ts from PostHog + first-party DB.
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

export type AnalyticsDashboardData = {
  meta: {
    source: "posthog" | "database" | "mixed";
    fetchedAt: string;
    postHogEnabled: boolean;
  };
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

/** @deprecated Use AnalyticsDashboardData */
export type MockAnalyticsDashboard = AnalyticsDashboardData;
