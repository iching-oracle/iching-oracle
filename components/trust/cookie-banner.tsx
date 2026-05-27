"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useConsent } from "@/components/trust/consent-provider";

export function CookieBanner() {
  const { acceptAll, rejectOptional, openPreferences } = useConsent();

  return (
    <motion.div
      role="dialog"
      aria-label="Cookie consent"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-zen-surface/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:p-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-amber-gold">
            Your privacy
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zen-muted">
            We use essential cookies for sign-in and security. Optional analytics
            help us improve the oracle — only with your consent.{" "}
            <Link href="/cookies" className="text-amber-gold hover:underline">
              Cookie policy
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={openPreferences}
            className="min-h-[44px] rounded-full border border-white/15 px-5 py-2.5 text-sm text-foreground hover:border-amber-gold/30"
          >
            Preferences
          </button>
          <button
            type="button"
            onClick={rejectOptional}
            className="min-h-[44px] rounded-full border border-white/15 px-5 py-2.5 text-sm text-zen-muted hover:text-foreground"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="auth-btn-primary min-h-[44px] px-6 py-2.5 text-sm"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </motion.div>
  );
}
