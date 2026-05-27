"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type PremiumGateProps = {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  blurred?: boolean;
};

export function PremiumGate({
  title = "Premium insight",
  description = "Unlock deeper AI analysis, pattern insights, and 500 monthly credits.",
  children,
  blurred = true,
}: PremiumGateProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-gold/20">
      {children ? (
        <div
          className={blurred ? "pointer-events-none select-none blur-sm" : ""}
          aria-hidden={blurred}
        >
          {children}
        </div>
      ) : null}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${children ? "absolute inset-0" : ""} flex flex-col items-center justify-center bg-zen-bg/80 p-8 text-center backdrop-blur-sm`}
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold">
          Premium
        </p>
        <h3 className="mt-2 font-serif text-xl text-foreground">{title}</h3>
        <p className="mt-2 max-w-sm text-sm text-zen-muted">{description}</p>
        <Link href="/pricing" className="auth-btn-primary mt-6 text-sm">
          Upgrade to Premium
        </Link>
      </motion.div>
    </div>
  );
}
