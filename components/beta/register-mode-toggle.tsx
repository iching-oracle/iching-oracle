"use client";

import { motion } from "framer-motion";
import type { RegisterOnboardingMode } from "@/lib/beta/register-params";

type RegisterModeToggleProps = {
  mode: RegisterOnboardingMode;
  onModeChange: (mode: RegisterOnboardingMode) => void;
};

const MODES: Array<{
  id: RegisterOnboardingMode;
  label: string;
  hint: string;
}> = [
  {
    id: "request",
    label: "Request access",
    hint: "Join the waitlist",
  },
  {
    id: "invite",
    label: "I have a code",
    hint: "Continue with invite",
  },
];

export function RegisterModeToggle({
  mode,
  onModeChange,
}: RegisterModeToggleProps) {
  return (
    <div
      className="onboarding-mode-toggle"
      role="tablist"
      aria-label="Registration path"
    >
      {MODES.map((item) => {
        const active = mode === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onModeChange(item.id)}
            className={`onboarding-mode-btn tap-feedback min-h-12 ${
              active ? "onboarding-mode-btn--active" : ""
            }`}
          >
            {active ? (
              <motion.span
                layoutId="register-mode-highlight"
                className="onboarding-mode-highlight"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                aria-hidden
              />
            ) : null}
            <span className="relative z-10 block">
              <span className="block font-medium tracking-wide text-foreground">
                {item.label}
              </span>
              <span className="mt-0.5 block text-[10px] uppercase tracking-widest text-zen-muted">
                {item.hint}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
