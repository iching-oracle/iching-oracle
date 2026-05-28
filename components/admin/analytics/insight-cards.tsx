"use client";

import { motion } from "framer-motion";
import type { ProductInsight } from "@/types/product-insight";

const severityStyles: Record<ProductInsight["severity"], string> = {
  info: "border-white/10 bg-zen-surface/40",
  warning: "border-amber-500/30 bg-amber-500/5",
  positive: "border-emerald-500/30 bg-emerald-500/5",
};

export function InsightCards({ insights }: { insights: ProductInsight[] }) {
  if (insights.length === 0) {
    return (
      <p className="text-sm text-zen-muted">
        Insights will appear as more product events are collected.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {insights.map((insight, i) => (
        <motion.article
          key={insight.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className={`rounded-2xl border p-5 ${severityStyles[insight.severity]}`}
        >
          <p className="text-[10px] font-medium uppercase tracking-widest text-amber-gold/80">
            {insight.type}
          </p>
          <h3 className="mt-2 font-serif text-lg text-foreground">
            {insight.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-zen-muted">
            {insight.body}
          </p>
        </motion.article>
      ))}
    </div>
  );
}
