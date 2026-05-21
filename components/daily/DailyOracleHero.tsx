"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type DailyOracleHeroProps = {
  date: string;
  streak: number;
  isAuthenticated: boolean;
};

export function DailyOracleHero({
  date,
  streak,
  isAuthenticated,
}: DailyOracleHeroProps) {
  const formatted = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <p className="text-xs font-medium uppercase tracking-[0.35em] text-cosmic-violet">
        Daily Oracle
      </p>
      <h1 className="mt-3 bg-gradient-to-r from-amber-gold via-amber-glow to-cosmic-violet bg-clip-text font-serif text-3xl font-semibold text-transparent sm:text-4xl">
        Today&apos;s hexagram
      </h1>
      <p className="mt-2 text-sm text-zen-muted">{formatted}</p>

      {isAuthenticated && streak > 0 ? (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-gold/25 bg-amber-gold/10 px-4 py-1.5 text-xs text-amber-glow">
          <span aria-hidden>✦</span>
          {streak} day streak
        </p>
      ) : null}

      {isAuthenticated ? (
        <Link
          href="/daily/history"
          className="mt-6 inline-block text-xs uppercase tracking-widest text-zen-muted transition-colors hover:text-amber-gold"
        >
          View oracle history
        </Link>
      ) : (
        <p className="mt-6 text-xs text-zen-muted">
          <Link href="/register" className="text-amber-gold hover:text-amber-glow">
            Sign in
          </Link>{" "}
          to save your daily oracles and build a streak.
        </p>
      )}
    </motion.header>
  );
}
