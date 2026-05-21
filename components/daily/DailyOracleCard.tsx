"use client";

import { motion } from "framer-motion";
import { DailyHexagramDisplay } from "@/components/daily/DailyHexagramDisplay";
import { EnergyMeter } from "@/components/daily/EnergyMeter";
import { OracleQuote } from "@/components/daily/OracleQuote";
import { ShareOracleButton } from "@/components/daily/ShareOracleButton";
import type { DailyOraclePayload } from "@/types/daily-oracle";

type DailyOracleCardProps = {
  oracle: DailyOraclePayload;
};

export function DailyOracleCard({ oracle }: DailyOracleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden rounded-3xl border border-amber-gold/20 bg-gradient-to-b from-zen-surface/95 via-cosmic-deep/30 to-zen-bg/90 p-6 shadow-[0_0_80px_-24px_rgba(197,160,89,0.45)] backdrop-blur-xl sm:p-10"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-gold/60 to-transparent"
        aria-hidden
      />

      <div className="relative space-y-8">
        <DailyHexagramDisplay hexagramNumber={oracle.hexagramNumber} />

        <OracleQuote label="Oracle message" delay={0.15} accent="gold">
          {oracle.oracleMessage}
        </OracleQuote>

        <EnergyMeter level={oracle.energyLevel} theme={oracle.energyTheme} />

        <OracleQuote label="Emotional insight" delay={0.25}>
          {oracle.emotionalInsight}
        </OracleQuote>

        <OracleQuote label="Recommended action" delay={0.32} accent="violet">
          {oracle.recommendedAction}
        </OracleQuote>

        <OracleQuote label="Caution" delay={0.38}>
          {oracle.caution}
        </OracleQuote>

        <OracleQuote label="Lucky focus" delay={0.42} accent="gold">
          <span className="font-serif text-lg text-amber-glow">
            {oracle.luckyFocus}
          </span>
        </OracleQuote>

        <motion.blockquote
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="border-l-2 border-amber-gold/50 py-2 pl-5"
        >
          <p className="font-serif text-xl italic leading-relaxed text-foreground/95 sm:text-2xl">
            &ldquo;{oracle.reflectionQuote}&rdquo;
          </p>
        </motion.blockquote>

        <ShareOracleButton oracle={oracle} />
      </div>
    </motion.div>
  );
}
