"use client";

import { motion } from "framer-motion";

type EnergyMeterProps = {
  level: number;
  theme: string;
};

const THEME_COLORS: Record<string, string> = {
  serene: "from-sky-400/80 to-cyan-300/60",
  rising: "from-amber-400/90 to-amber-glow/70",
  turbulent: "from-violet-500/70 to-indigo-400/50",
  radiant: "from-amber-gold to-amber-glow",
  contemplative: "from-cosmic-violet/80 to-cosmic-purple/50",
  balanced: "from-amber-gold/70 to-cosmic-violet/50",
};

export function EnergyMeter({ level, theme }: EnergyMeterProps) {
  const gradient = THEME_COLORS[theme] ?? THEME_COLORS.balanced;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-zen-muted">
        <span>Daily energy</span>
        <span className="text-amber-glow">{theme}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          className={`h-full rounded-full bg-gradient-to-r ${gradient} shadow-[0_0_12px_rgba(197,160,89,0.4)]`}
        />
      </div>
      <p className="text-right text-[10px] text-zen-muted">{level}% resonance</p>
    </div>
  );
}
