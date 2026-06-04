"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EmotionalToneMonth } from "@/types/insights";

const TOOLTIP_STYLE = {
  backgroundColor: "rgba(18, 20, 28, 0.95)",
  border: "1px solid rgba(197, 160, 89, 0.25)",
  borderRadius: "8px",
  fontSize: "12px",
};

type EmotionalTrendChartProps = {
  data: EmotionalToneMonth[];
  blurred?: boolean;
};

export function EmotionalTrendChart({
  data,
  blurred = false,
}: EmotionalTrendChartProps) {
  if (data.length === 0) return null;

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-zen-surface/60 p-5 backdrop-blur-xl ${blurred ? "pointer-events-none select-none blur-md" : ""}`}
      aria-label="Emotional tone trends by month"
    >
      <h3 className="text-xs font-medium uppercase tracking-widest text-zen-muted">
        Emotional tone (inferred from questions)
      </h3>
      <p className="mt-1 text-[11px] text-zen-muted/80">
        Keyword signals only — not a clinical assessment.
      </p>
      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="monthLabel"
              tick={{ fill: "#8b8d94", fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fill: "#8b8d94", fontSize: 10 }} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="calm"
              stackId="1"
              stroke="#7c3aed"
              fill="rgba(124, 58, 237, 0.35)"
            />
            <Area
              type="monotone"
              dataKey="hopeful"
              stackId="1"
              stroke="#c5a059"
              fill="rgba(197, 160, 89, 0.35)"
            />
            <Area
              type="monotone"
              dataKey="seeking"
              stackId="1"
              stroke="#60a5fa"
              fill="rgba(96, 165, 250, 0.3)"
            />
            <Area
              type="monotone"
              dataKey="turbulent"
              stackId="1"
              stroke="#f87171"
              fill="rgba(248, 113, 113, 0.25)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
