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
import type { CategoryPoint } from "@/lib/admin/mock-analytics-data";

export function CategoryBarChart({
  title,
  data,
  delay = 0,
}: {
  title: string;
  data: CategoryPoint[];
  delay?: number;
}) {
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
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#8b8d94", fontSize: 10 }}
              tickLine={false}
            />
            <YAxis tick={{ fill: "#8b8d94", fontSize: 10 }} width={32} />
            <Tooltip
              contentStyle={{
                background: "#12141c",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
              }}
            />
            <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
