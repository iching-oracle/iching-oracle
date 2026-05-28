"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type CategoryBarChartProps = {
  data: Array<{ category: string; count: number }>;
};

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-zen-muted">No category data yet.</p>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis
            dataKey="category"
            tick={{ fill: "#8b8d94", fontSize: 10 }}
            tickFormatter={(v) => String(v).slice(0, 12)}
          />
          <YAxis tick={{ fill: "#8b8d94", fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "#12141c",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
            }}
          />
          <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
