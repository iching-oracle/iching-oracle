"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type UsageChartProps = {
  data: Array<{ day: string; tokens: number; generations: number }>;
};

export function UsageChart({ data }: UsageChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-zen-muted">No AI usage data for this period.</p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="tokensFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1a2e",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
            }}
            labelStyle={{ color: "#c5a059" }}
          />
          <Area
            type="monotone"
            dataKey="tokens"
            stroke="#8b5cf6"
            fill="url(#tokensFill)"
            name="Tokens"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
