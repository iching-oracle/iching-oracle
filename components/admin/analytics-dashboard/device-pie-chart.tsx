"use client";

import { motion } from "framer-motion";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = ["#c5a059", "#7c3aed", "#6366f1"];

export function DevicePieChart({
  data,
  delay = 0,
}: {
  data: Array<{ name: string; value: number }>;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className="rounded-2xl border border-white/10 bg-zen-surface/50 p-5 backdrop-blur-xl sm:p-6"
    >
      <h3 className="text-sm font-medium text-foreground">Device usage</h3>
      <div className="mt-4 h-56 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={3}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#12141c",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-zen-muted">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            {d.name} {d.value}%
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
