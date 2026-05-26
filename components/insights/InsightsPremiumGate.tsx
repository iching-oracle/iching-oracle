"use client";

import Link from "next/link";
import { UpgradeCheckoutButton } from "@/components/subscription/UpgradeCheckoutButton";

type InsightsPremiumGateProps = {
  statTeaser: string;
  partialSummary?: string;
};

export function InsightsPremiumGate({
  statTeaser,
  partialSummary,
}: InsightsPremiumGateProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-gold/30 bg-gradient-to-b from-cosmic-deep/40 to-zen-surface/80 p-8 text-center backdrop-blur-xl sm:p-10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.08),transparent_70%)]"
        aria-hidden
      />
      <p className="relative text-xs font-medium uppercase tracking-[0.3em] text-amber-gold">
        Premium · Pattern Insight
      </p>
      <h2 className="relative mt-4 font-serif text-2xl text-foreground">
        See the story your readings tell
      </h2>
      <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-zen-muted">
        {statTeaser}
      </p>
      {partialSummary ? (
        <p className="relative mx-auto mt-4 max-w-lg text-sm italic text-foreground/70 line-clamp-3">
          &ldquo;{partialSummary}&rdquo;
        </p>
      ) : null}
      <div className="relative mt-8 flex flex-col items-center gap-3">
        <UpgradeCheckoutButton highlighted label="Unlock Pattern Insight" />
        <Link href="/pricing" className="text-xs text-zen-muted hover:text-amber-gold">
          Compare plans
        </Link>
      </div>
    </div>
  );
}
