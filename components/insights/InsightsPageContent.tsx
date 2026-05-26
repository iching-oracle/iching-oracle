"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { InsightStatCard } from "@/components/insights/InsightStatCard";
import { InsightsCharts } from "@/components/insights/InsightsCharts";
import { InsightsPremiumGate } from "@/components/insights/InsightsPremiumGate";
import type { InsightsPagePayload } from "@/types/insights";

type InsightsPageContentProps = {
  data: InsightsPagePayload;
};

export function InsightsPageContent({ data }: InsightsPageContentProps) {
  const { analytics, ai, isPremium, statTeaser } = data;
  const locked = !isPremium;
  const empty = analytics.totalReadings === 0;

  if (empty) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-zen-elevated/30 px-8 py-16 text-center">
        <p className="font-serif text-xl text-foreground/90">
          Your patterns await
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-zen-muted">
          Save a few consultations in your journal. Once history builds, Pattern
          Insight will reflect recurring themes back to you.
        </p>
        <Link href="/reading/new" className="auth-btn-primary mt-8 inline-block">
          Cast your first hexagram
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-cosmic-violet">
          Pattern Insight
        </p>
        <h1 className="mt-3 bg-gradient-to-r from-amber-gold via-amber-glow to-cosmic-violet bg-clip-text font-serif text-3xl font-semibold text-transparent sm:text-4xl">
          Your spiritual journey, reflected
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zen-muted">
          Discover recurring themes hidden within your readings — grounded in
          your journal, interpreted with calm intelligence.
        </p>
        {data.generatedAt && isPremium ? (
          <p className="mt-2 text-[10px] uppercase tracking-widest text-zen-muted/80">
            {data.cacheHit ? "Cached insight · " : "Updated · "}
            {new Date(data.generatedAt).toLocaleString()}
          </p>
        ) : null}
      </motion.header>

      {locked ? (
        <InsightsPremiumGate
          statTeaser={statTeaser}
          partialSummary={
            analytics.topCategory
              ? `Your journal leans toward ${analytics.topCategory.label.toLowerCase()} — unlock the full narrative.`
              : undefined
          }
        />
      ) : null}

      <div
        className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-5 ${locked ? "opacity-90" : ""}`}
      >
        <InsightStatCard
          label="Total readings"
          value={String(analytics.totalReadings)}
          delay={0.05}
        />
        <InsightStatCard
          label="This month"
          value={String(analytics.readingsThisMonth)}
          delay={0.1}
        />
        <InsightStatCard
          label="Favorites"
          value={String(analytics.favoriteCount)}
          delay={0.15}
        />
        <InsightStatCard
          label="Top category"
          value={analytics.topCategory?.label ?? "—"}
          hint={
            analytics.topCategory
              ? `${analytics.topCategory.count} readings`
              : undefined
          }
          delay={0.2}
        />
        <InsightStatCard
          label="Recurring hexagram"
          value={analytics.topHexagram?.chineseName ?? "—"}
          hint={analytics.topHexagram?.title}
          delay={0.25}
        />
      </div>

      {ai && isPremium ? (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl border border-amber-gold/25 bg-gradient-to-br from-zen-surface/95 via-cosmic-deep/25 to-zen-bg/90 p-6 shadow-[0_0_80px_-24px_rgba(197,160,89,0.4)] backdrop-blur-xl sm:p-10"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-gold/50 to-transparent"
            aria-hidden
          />
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-amber-gold">
            AI insight summary
          </p>
          <p className="mt-4 text-base leading-relaxed text-foreground/90">
            {ai.summary}
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-cosmic-violet">
                Recurring themes
              </h3>
              <ul className="mt-3 space-y-2">
                {ai.themes.map((t) => (
                  <li
                    key={t}
                    className="flex gap-2 text-sm text-foreground/85"
                  >
                    <span className="text-amber-gold">✦</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest text-cosmic-violet">
                Patterns observed
              </h3>
              <ul className="mt-3 space-y-2">
                {ai.patterns.map((p) => (
                  <li key={p} className="text-sm leading-relaxed text-zen-muted">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>
      ) : locked ? (
        <div className="relative">
          <div className="pointer-events-none select-none blur-lg">
            <div className="rounded-3xl border border-white/10 bg-zen-surface/50 p-8">
              <p className="text-sm text-zen-muted">
                Your personalized AI narrative unlocks with Premium — weaving
                hexagram recurrence, emotional tone, and the rhythm of your
                questions into one reflective portrait.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <InsightsCharts analytics={analytics} blurred={locked} />

      {analytics.topHexagrams.length > 0 ? (
        <section className={locked ? "pointer-events-none blur-md" : ""}>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-zen-muted">
            Recurring hexagrams
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {analytics.topHexagrams.map((h, i) => (
              <motion.div
                key={h.number}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-xl border border-white/10 bg-zen-elevated/50 px-4 py-3"
              >
                <p className="font-serif text-lg text-amber-gold">
                  {h.chineseName}
                </p>
                <p className="text-xs text-zen-muted line-clamp-1">{h.title}</p>
                <p className="mt-2 text-sm text-foreground/80">
                  Weight {h.count}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      ) : null}

      {ai && isPremium ? (
        <section className="rounded-2xl border border-white/10 bg-zen-surface/60 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="text-xs font-medium uppercase tracking-widest text-amber-gold">
            Reflection suggestions
          </h2>
          <ul className="mt-4 space-y-4">
            {ai.reflections.map((r) => (
              <li
                key={r}
                className="border-l-2 border-cosmic-violet/40 pl-4 text-sm leading-relaxed text-foreground/85"
              >
                {r}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {isPremium ? (
        <p className="text-center">
          <Link
            href="/insights?refresh=1"
            className="text-xs text-zen-muted hover:text-amber-gold"
          >
            Request fresh analysis
          </Link>
          <span className="mx-2 text-zen-muted/50">·</span>
          <Link href="/history" className="text-xs text-zen-muted hover:text-amber-gold">
            View journal
          </Link>
        </p>
      ) : null}
    </div>
  );
}
