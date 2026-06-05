"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BetaWaitlistForm } from "@/components/beta/beta-waitlist-form";
import { RegisterForm } from "@/components/register-form";
import { RegisterModeToggle } from "@/components/beta/register-mode-toggle";
import {
  getInviteCodeFromSearchParams,
  resolveInitialOnboardingMode,
  type RegisterOnboardingMode,
} from "@/lib/beta/register-params";

type RegisterOnboardingProps = {
  inviteOnly: boolean;
};

const PANEL_MOTION = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
};

export function RegisterOnboarding({ inviteOnly }: RegisterOnboardingProps) {
  const searchParams = useSearchParams();
  const initialCode = getInviteCodeFromSearchParams(searchParams);
  const [mode, setMode] = useState<RegisterOnboardingMode>(() =>
    resolveInitialOnboardingMode(searchParams),
  );

  useEffect(() => {
    if (initialCode) setMode("invite");
  }, [initialCode]);

  if (!inviteOnly) {
    return (
      <RegisterForm
        inviteRequired={false}
        initialInviteCode={initialCode}
      />
    );
  }

  return (
    <div className="space-y-6">
      <RegisterModeToggle mode={mode} onModeChange={setMode} />

      <AnimatePresence mode="wait">
        {mode === "request" ? (
          <motion.div
            key="request"
            {...PANEL_MOTION}
            className="space-y-6"
            role="tabpanel"
            aria-label="Request access"
          >
            <div className="rounded-2xl border border-white/[0.06] bg-zen-elevated/30 px-5 py-5 text-center">
              <p className="font-serif text-lg text-foreground/95">
                A quiet early access
              </p>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-zen-muted">
                Join the waitlist and we will reach out personally when a spot
                opens. Curated, intentional, unhurried.
              </p>
            </div>

            <BetaWaitlistForm
              source="register_request"
              variant="onboarding"
            />

            <p className="text-center text-xs text-zen-muted">
              Already have a code?{" "}
              <button
                type="button"
                onClick={() => setMode("invite")}
                className="font-medium text-amber-gold transition-colors hover:text-amber-glow"
              >
                Switch to invite registration
              </button>
              {" · "}
              <Link
                href="/beta"
                className="text-amber-gold/90 transition-colors hover:text-amber-gold"
              >
                About the beta
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="invite"
            {...PANEL_MOTION}
            role="tabpanel"
            aria-label="Enter invite code"
          >
            <div className="mb-5 rounded-2xl border border-amber-gold/15 bg-amber-gold/5 px-5 py-4 text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-amber-gold/80">
                Private beta
              </p>
              <p className="mt-2 font-serif text-lg text-foreground">
                You already have access
              </p>
              <p className="mt-1 text-sm text-zen-muted">
                Enter your invitation code to create your account.
              </p>
            </div>

            <RegisterForm
              inviteRequired
              initialInviteCode={initialCode}
              autoFocusInvite={Boolean(initialCode)}
            />

            <p className="mt-6 text-center text-xs text-zen-muted">
              Need an invite?{" "}
              <button
                type="button"
                onClick={() => setMode("request")}
                className="font-medium text-amber-gold transition-colors hover:text-amber-glow"
              >
                Request access
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
