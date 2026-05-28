"use client";

import { motion } from "framer-motion";
import type { InsightItem } from "@/lib/admin/mock-analytics-data";

const styles: Record<InsightItem["severity"], string> = {
  info: "border-white/10 bg-white/[0.03]",
  warning: "border-amber-500/30 bg-amber-500/5",
  positive: "border-emerald-500/30 bg-emerald-500/5",
};

export function InsightCard({
  insight,
  index = 0,
}: {
  insight: InsightItem;
  index?: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`rounded-xl border p-4 ${styles[insight.severity]}`}
    >
      <span className="text-[10px] font-medium uppercase tracking-widest text-amber-gold/80">
        {insight.type}
      </span>
      <h4 className="mt-2 text-sm font-medium text-foreground">{insight.title}</h4>
      <p className="mt-2 text-xs leading-relaxed text-zen-muted">{insight.body}</p>
    </motion.article>
  );
}
