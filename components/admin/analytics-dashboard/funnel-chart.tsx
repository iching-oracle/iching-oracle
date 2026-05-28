"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FunnelStep } from "@/lib/admin/mock-analytics-data";

type FunnelChartProps = {
  title: string;
  data: FunnelStep[];
  delay?: number;
};

export function FunnelChart({ title, data, delay = 0 }: FunnelChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: d.step,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className="rounded-2xl border border-white/10 bg-zen-surface/50 p-5 backdrop-blur-xl sm:p-6"
    >
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <div className="mt-4 h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatted} layout="vertical" margin={{ left: 4, right: 8 }}>
            <XAxis type="number" tick={{ fill: "#8b8d94", fontSize: 10 }} />
            <YAxis
              type="category"
              dataKey="label"
              width={100}
              tick={{ fill: "#8b8d94", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                background: "#12141c",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
              }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={700}>
              {formatted.map((entry, i) => (
                <Cell key={entry.step} fill={entry.fill ?? "#7c3aed"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
