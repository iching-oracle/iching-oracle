"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type FunnelChartProps = {
  data: Array<{ step: string; count: number }>;
  title: string;
};

export function FunnelChart({ data, title }: FunnelChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-zen-muted">No funnel data for this period.</p>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: d.step.replace(/_/g, " "),
  }));

  return (
    <div>
      <p className="text-xs text-zen-muted">{title}</p>
      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatted} layout="vertical" margin={{ left: 8 }}>
            <XAxis type="number" tick={{ fill: "#8b8d94", fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="label"
              width={120}
              tick={{ fill: "#8b8d94", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                background: "#12141c",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
              }}
            />
            <Bar dataKey="count" fill="#c5a059" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
