"use client";

import { motion } from "framer-motion";
import type { InsightPeriodReport } from "@/types/insights";

type PeriodReportCardProps = {
  report: InsightPeriodReport;
  variant: "weekly" | "monthly";
};

export function PeriodReportCard({ report, variant }: PeriodReportCardProps) {
  const label = variant === "weekly" ? "Weekly reflection" : "Monthly reflection";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-zen-surface/70 p-6 backdrop-blur-xl sm:p-8"
    >
      <p className="text-xs font-medium uppercase tracking-[0.28em] text-amber-gold">
        {label}
      </p>
      <p className="mt-1 text-[10px] text-zen-muted">{report.periodLabel}</p>
      <h3 className="mt-3 font-serif text-xl text-foreground">{report.headline}</h3>
      <p className="mt-4 text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
        {report.body}
      </p>
      {report.highlights.length > 0 ? (
        <ul className="mt-6 space-y-2">
          {report.highlights.map((h) => (
            <li key={h} className="flex gap-2 text-sm text-zen-muted">
              <span className="text-amber-gold">·</span>
              {h}
            </li>
          ))}
        </ul>
      ) : null}
      {report.gentlePrompts.length > 0 ? (
        <div className="mt-6 border-t border-white/8 pt-4">
          <p className="text-[10px] uppercase tracking-widest text-cosmic-violet">
            Gentle prompts
          </p>
          <ul className="mt-2 space-y-2">
            {report.gentlePrompts.map((p) => (
              <li
                key={p}
                className="border-l-2 border-amber-gold/30 pl-3 text-sm italic text-foreground/75"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </motion.article>
  );
}
