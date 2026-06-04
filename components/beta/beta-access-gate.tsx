"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BetaWaitlistForm } from "@/components/beta/beta-waitlist-form";
import { HexagramMark } from "@/components/landing/hexagram-mark";

/** Shown when closed beta is on and the user has no invite code. */
export function BetaAccessGate() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 text-center"
    >
      <div className="mx-auto flex max-w-xs justify-center rounded-2xl border border-white/[0.06] bg-zen-surface/40 px-8 py-6">
        <HexagramMark />
      </div>

      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-cosmic-violet">
          Private beta
        </p>
        <h2 className="mt-3 font-serif text-2xl text-foreground sm:text-3xl">
          Invite-only access
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-zen-muted">
          I Ching Oracle is in a quiet early access phase. Join the waitlist and
          we will send a personal invite when a spot opens.
        </p>
      </div>

      <div className="mx-auto max-w-sm text-left">
        <BetaWaitlistForm source="register_gate" />
      </div>

      <p className="text-xs text-zen-muted">
        Already have a code?{" "}
        <Link
          href="/register"
          className="font-medium text-amber-gold hover:underline"
        >
          Enter it here
        </Link>
        {" · "}
        <Link href="/beta" className="text-amber-gold hover:underline">
          Learn about the beta
        </Link>
      </p>
    </motion.div>
  );
}
