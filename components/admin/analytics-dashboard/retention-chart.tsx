"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function RetentionChart({
  cohort,
  d1,
  d7,
  d30,
}: {
  cohort: Array<{ week: string; retained: number }>;
  d1: number;
  d7: number;
  d30: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-zen-surface/50 p-5 backdrop-blur-xl sm:p-6"
    >
      <h3 className="text-sm font-medium text-foreground">Retention cohort</h3>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "D1", value: d1 },
          { label: "D7", value: d7 },
          { label: "D30", value: d30 },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center"
          >
            <p className="text-[10px] uppercase tracking-wider text-zen-muted">
              {m.label}
            </p>
            <p className="mt-1 font-serif text-2xl text-amber-gold">{m.value}%</p>
          </div>
        ))}
      </div>
      <div className="mt-6 h-48 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={cohort}>
            <XAxis dataKey="week" tick={{ fill: "#8b8d94", fontSize: 10 }} />
            <YAxis tick={{ fill: "#8b8d94", fontSize: 10 }} unit="%" />
            <Tooltip
              contentStyle={{
                background: "#12141c",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
              }}
            />
            <Bar dataKey="retained" fill="#c5a059" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
