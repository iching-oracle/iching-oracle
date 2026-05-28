import { motion } from "framer-motion";
import { fadeUp } from "@/lib/guided-reading/motion";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  onClick?: () => void;
  as?: "div" | "button";
};

export function GlassCard({
  children,
  className = "",
  selected,
  onClick,
  as = "div",
}: GlassCardProps) {
  const base = `rounded-2xl border backdrop-blur-xl transition-shadow duration-300 ${
    selected
      ? "border-amber-gold/50 bg-amber-gold/10 shadow-[0_0_40px_-10px_rgba(197,160,89,0.45)]"
      : "border-white/10 bg-zen-surface/50 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] hover:border-amber-gold/25 hover:shadow-[0_0_28px_-12px_rgba(139,92,246,0.35)]"
  } ${className}`;

  if (as === "button") {
    return (
      <motion.button
        type="button"
        variants={fadeUp}
        onClick={onClick}
        className={`${base} min-h-[44px] text-left`}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.div variants={fadeUp} className={base}>
      {children}
    </motion.div>
  );
}
