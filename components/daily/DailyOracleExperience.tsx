"use client";

import { DailyOracleCard } from "@/components/daily/DailyOracleCard";
import { DailyOracleHero } from "@/components/daily/DailyOracleHero";
import { FloatingParticles } from "@/components/daily/FloatingParticles";
import type { DailyOraclePayload } from "@/types/daily-oracle";

type DailyOracleExperienceProps = {
  oracle: DailyOraclePayload;
  dateLabel: string;
};

export function DailyOracleExperience({
  oracle,
  dateLabel,
}: DailyOracleExperienceProps) {
  return (
    <div className="relative min-h-full overflow-hidden bg-zen-bg">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.12),_transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-amber-gold/[0.06] blur-[100px]"
        aria-hidden
      />
      <FloatingParticles />

      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-12 sm:px-10 sm:py-16">
        <DailyOracleHero
          date={oracle.date}
          dateLabel={dateLabel}
          streak={oracle.streak}
          isAuthenticated={oracle.isAuthenticated}
        />
        <DailyOracleCard oracle={oracle} />
      </main>
    </div>
  );
}
