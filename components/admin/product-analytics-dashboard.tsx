"use client";

import { motion } from "framer-motion";
import { StatCard } from "@/components/admin/stat-card";
import { ReadingsChart } from "@/components/admin/readings-chart";
import { FunnelChart } from "@/components/admin/analytics/funnel-chart";
import { CategoryBarChart } from "@/components/admin/analytics/category-bar-chart";
import { InsightCards } from "@/components/admin/analytics/insight-cards";
import type { getProductAnalyticsDashboard } from "@/lib/admin/product-analytics";

type DashboardData = Awaited<ReturnType<typeof getProductAnalyticsDashboard>>;

export function ProductAnalyticsDashboard({ data }: { data: DashboardData }) {
  const { overview, revenue, readings, behavior, errors, charts, insights } =
    data;

  return (
    <div className="space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
          Overview
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="DAU" value={overview.dau} />
          <StatCard label="WAU" value={overview.wau} />
          <StatCard label="MAU" value={overview.mau} />
          <StatCard
            label="Total readings"
            value={overview.totalReadings}
            hint={`${overview.readings30d} last 30d`}
          />
          <StatCard
            label="Conversion"
            value={`${overview.conversionRate.toFixed(1)}%`}
          />
          <StatCard
            label="D7 retention"
            value={`${overview.retentionD7.toFixed(0)}%`}
          />
          <StatCard
            label="Avg AI response"
            value={
              overview.avgResponseTimeMs > 0
                ? `${(overview.avgResponseTimeMs / 1000).toFixed(1)}s`
                : "—"
            }
          />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border border-white/10 bg-zen-surface/40 p-6"
      >
        <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
          Smart insights
        </h2>
        <div className="mt-4">
          <InsightCards insights={insights} />
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-zen-surface/40 p-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
            Event volume (30d)
          </h2>
          <div className="mt-4">
            <ReadingsChart data={charts.eventsPerDay} />
          </div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-zen-surface/40 p-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
            Readings per day
          </h2>
          <div className="mt-4">
            <ReadingsChart data={charts.readingsPerDay} />
          </div>
        </section>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
          Reading analytics
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Generated (30d)" value={readings.generated30d} />
          <StatCard label="Completed (30d)" value={readings.completed30d} />
          <StatCard
            label="Completion rate"
            value={`${readings.completionRate.toFixed(0)}%`}
          />
          <StatCard
            label="Follow-up rate"
            value={`${readings.followUpRate.toFixed(0)}%`}
          />
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-zen-surface/40 p-6">
          <h3 className="text-xs uppercase tracking-widest text-zen-muted">
            Popular categories
          </h3>
          <CategoryBarChart data={readings.categoryCounts} />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
          Revenue
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Est. MRR" value={`€${revenue.mrr.toFixed(0)}`} />
          <StatCard label="Active subscribers" value={revenue.activeSubscribers} />
          <StatCard label="Free users" value={revenue.freeUsers} />
          <StatCard
            label="Paid ratio"
            value={`${revenue.paidRatio.toFixed(1)}%`}
          />
          <StatCard
            label="Checkouts (30d)"
            value={revenue.checkoutInitiated30d}
          />
          <StatCard
            label="New subs (30d)"
            value={revenue.subscriptionsStarted30d}
          />
          <StatCard label="Churn events (30d)" value={revenue.churnEvents30d} />
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-zen-surface/40 p-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
            Reading funnel
          </h2>
          <div className="mt-4">
            <FunnelChart
              data={behavior.funnelReading}
              title="Landing → subscribe"
            />
          </div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-zen-surface/40 p-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
            Signup retention funnel
          </h2>
          <div className="mt-4">
            <FunnelChart
              data={behavior.funnelSignup}
              title="Signup → paid"
            />
          </div>
        </section>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <div className="rounded-2xl border border-white/10 bg-zen-surface/40 p-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
            Top pages
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {behavior.topPages.map((p) => (
              <li key={p.path} className="flex justify-between text-zen-muted">
                <span className="truncate pr-4 text-foreground">{p.path}</span>
                <span>{p.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zen-surface/40 p-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
            Top CTAs / buttons
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {behavior.topButtons.map((b) => (
              <li key={b.button} className="flex justify-between text-zen-muted">
                <span className="text-foreground">{b.button}</span>
                <span>{b.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      <section className="rounded-2xl border border-white/10 bg-zen-surface/40 p-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
          Device mix (30d)
        </h2>
        <ul className="mt-4 flex flex-wrap gap-4 text-sm">
          {behavior.deviceBreakdown.map((d) => (
            <li
              key={d.device}
              className="rounded-full border border-white/10 px-4 py-2 text-zen-muted"
            >
              <span className="text-foreground">{d.device}</span>
              <span className="ml-2 text-amber-gold">{d.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
          Error monitoring
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="AI failures (30d)" value={errors.aiFailures30d} />
          <StatCard label="Payment failures" value={errors.paymentFailures30d} />
          <StatCard label="API errors" value={errors.apiErrors30d} />
          <StatCard label="System errors" value={errors.systemErrors30d} />
        </div>
      </motion.section>

      <p className="text-sm text-zen-muted">
        PostHog receives consent-gated client events when{" "}
        <code className="text-amber-gold/80">NEXT_PUBLIC_POSTHOG_KEY</code> is
        set. First-party events power this dashboard regardless.
      </p>
    </div>
  );
}
