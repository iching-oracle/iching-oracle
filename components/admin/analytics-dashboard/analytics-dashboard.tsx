"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnalyticsDashboardData } from "@/lib/admin/analytics-dashboard-types";
import {
  DashboardSidebar,
  type AnalyticsSectionId,
  ANALYTICS_SECTIONS,
} from "@/components/admin/analytics-dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/admin/analytics-dashboard/dashboard-topbar";
import { MetricCard } from "@/components/admin/analytics-dashboard/metric-card";
import { AnalyticsChart } from "@/components/admin/analytics-dashboard/analytics-chart";
import { FunnelChart } from "@/components/admin/analytics-dashboard/funnel-chart";
import { CategoryBarChart } from "@/components/admin/analytics-dashboard/category-bar-chart";
import { DevicePieChart } from "@/components/admin/analytics-dashboard/device-pie-chart";
import { InsightCard } from "@/components/admin/analytics-dashboard/insight-card";
import { ErrorTable } from "@/components/admin/analytics-dashboard/error-table";
import { BehaviorList } from "@/components/admin/analytics-dashboard/behavior-list";
import { RetentionChart } from "@/components/admin/analytics-dashboard/retention-chart";

type AnalyticsDashboardProps = {
  data: AnalyticsDashboardData;
};

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const [activeSection, setActiveSection] = useState<AnalyticsSectionId>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const scrollToSection = useCallback((id: AnalyticsSectionId) => {
    setActiveSection(id);
    const el = document.getElementById(`analytics-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("analytics-", "") as AnalyticsSectionId;
            if (ANALYTICS_SECTIONS.some((s) => s.id === id)) {
              setActiveSection(id);
            }
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    for (const s of ANALYTICS_SECTIONS) {
      const el = document.getElementById(`analytics-${s.id}`);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] bg-zen-bg">
      <DashboardSidebar
        activeSection={activeSection}
        onNavigate={scrollToSection}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          meta={data.meta}
          onOpenMenu={() => setMobileOpen(true)}
        />

        <main ref={mainRef} className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-16 pb-20">
            {/* Overview */}
            <section id="analytics-overview" className="scroll-mt-24 space-y-8">
              <SectionHeader
                title="Overview"
                description="High-level product health at a glance."
              />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.overview.metrics.map((m, i) => (
                  <MetricCard key={m.id} metric={m} index={i} />
                ))}
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <AnalyticsChart
                  title="Daily readings"
                  subtitle="Last 30 days"
                  data={data.overview.dailyReadings}
                />
                <AnalyticsChart
                  title="User growth"
                  subtitle="Registered users"
                  data={data.overview.userGrowth}
                  color="#7c3aed"
                  delay={0.08}
                />
              </div>
            </section>

            {/* AI Insights */}
            <section className="space-y-4">
              <SectionHeader
                title="AI Product Insights"
                description="Automated patterns from user behavior (mock)."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {data.insights.map((insight, i) => (
                  <InsightCard key={insight.id} insight={insight} index={i} />
                ))}
              </div>
            </section>

            {/* Readings */}
            <section id="analytics-readings" className="scroll-mt-24 space-y-8">
              <SectionHeader
                title="Readings"
                description="Oracle usage and category trends."
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <StatPill label="Completion rate" value={`${data.readings.completionRate}%`} />
                <StatPill label="Follow-up rate" value={`${data.readings.followUpRate}%`} />
                <StatPill
                  label="Avg AI response"
                  value={`${data.readings.avgResponseSec}s`}
                />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <CategoryBarChart
                  title="Reading categories"
                  data={data.readings.categories}
                />
                <DevicePieChart data={data.devices} delay={0.1} />
              </div>
            </section>

            {/* Revenue */}
            <section id="analytics-revenue" className="scroll-mt-24 space-y-8">
              <SectionHeader
                title="Revenue"
                description="Subscription funnel and monetization."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <StatPill label="MRR" value={`€${data.revenue.mrr.toLocaleString()}`} />
                <StatPill
                  label="Active subscribers"
                  value={String(data.revenue.activeSubscribers)}
                />
              </div>
              <FunnelChart
                title="Subscription conversion funnel"
                data={data.revenue.conversionFunnel}
              />
            </section>

            {/* Users */}
            <section id="analytics-users" className="scroll-mt-24 space-y-8">
              <SectionHeader title="Users" description="Growth and acquisition." />
              <div className="grid gap-4 sm:grid-cols-2">
                <StatPill label="Total users" value={data.users.total.toLocaleString()} />
                <StatPill
                  label="New this month"
                  value={data.users.newThisMonth.toLocaleString()}
                />
              </div>
              <AnalyticsChart
                title="User growth"
                data={data.users.growth}
                color="#6366f1"
              />
            </section>

            {/* Retention */}
            <section id="analytics-retention" className="scroll-mt-24 space-y-8">
              <SectionHeader
                title="Retention"
                description="Returning seekers and cohort curves."
              />
              <RetentionChart
                cohort={data.retention.cohort}
                d1={data.retention.d1}
                d7={data.retention.d7}
                d30={data.retention.d30}
              />
            </section>

            {/* Behavior */}
            <section className="space-y-6">
              <SectionHeader
                title="User behavior"
                description="Clicks, pages, and drop-off points."
              />
              <div className="grid gap-6 lg:grid-cols-3">
                <BehaviorList title="Most clicked buttons" rows={data.behavior.topButtons} />
                <BehaviorList title="Top landing pages" rows={data.behavior.topPages} />
                <BehaviorList
                  title="Drop-off points"
                  rows={data.behavior.dropOffs}
                  suffix="%"
                />
              </div>
            </section>

            {/* Errors */}
            <section id="analytics-errors" className="scroll-mt-24 space-y-8">
              <SectionHeader
                title="Error monitoring"
                description="API, AI, payments, and slow requests."
              />
              <div className="grid gap-6">
                <ErrorTable title="API errors" rows={data.errors.api} />
                <ErrorTable title="Failed readings" rows={data.errors.readings} />
                <ErrorTable title="Payment failures" rows={data.errors.payments} />
                <ErrorTable title="Slow requests" rows={data.errors.slow} />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="font-serif text-xl text-foreground sm:text-2xl">{title}</h2>
      <p className="mt-1 text-sm text-zen-muted">{description}</p>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-zen-surface/50 px-4 py-4 backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-wider text-zen-muted">{label}</p>
      <p className="mt-1 font-serif text-2xl text-amber-gold">{value}</p>
    </div>
  );
}
