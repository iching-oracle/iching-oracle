"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ReadingsChartProps = {
  data: Array<{ day: string; count: number }>;
};

export function ReadingsChart({ data }: ReadingsChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-zen-muted">No reading data for this period.</p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="readingsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c5a059" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#c5a059" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tick={{ fill: "#8b8d94", fontSize: 11 }}
            tickFormatter={(v) => v.slice(5)}
          />
          <YAxis tick={{ fill: "#8b8d94", fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "#12141c",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#c5a059"
            fill="url(#readingsFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
