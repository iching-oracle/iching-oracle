"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import type { DashboardMetric } from "@/lib/admin/mock-analytics-data";

const trendStyles = {
  up: "text-emerald-400",
  down: "text-red-400",
  neutral: "text-zen-muted",
};

export function MetricCard({ metric, index = 0 }: { metric: DashboardMetric; index?: number }) {
  const data = metric.sparkline.map((v, i) => ({ i, v }));
  const changeLabel =
    metric.trend === "up"
      ? `+${metric.change}%`
      : metric.trend === "down"
        ? `${metric.change}%`
        : `${metric.change}%`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="rounded-2xl border border-white/10 bg-zen-surface/60 p-5 backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zen-muted">
          {metric.label}
        </p>
        <span className={`text-xs font-medium ${trendStyles[metric.trend]}`}>
          {changeLabel}
        </span>
      </div>
      <p className="mt-3 font-serif text-3xl text-foreground">{metric.value}</p>
      <div className="mt-4 h-10 w-full opacity-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`spark-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c5a059" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#c5a059" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke="#c5a059"
              strokeWidth={1.5}
              fill={`url(#spark-${metric.id})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
