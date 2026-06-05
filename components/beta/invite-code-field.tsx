"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type InviteCodeStatus = "idle" | "checking" | "valid" | "invalid";

type InviteCodeFieldProps = {
  value: string;
  onChange: (value: string) => void;
  email?: string;
  onStatusChange?: (status: InviteCodeStatus, message: string | null) => void;
  autoFocus?: boolean;
};

export function InviteCodeField({
  value,
  onChange,
  email,
  onStatusChange,
  autoFocus = false,
}: InviteCodeFieldProps) {
  const [status, setStatus] = useState<InviteCodeStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  useEffect(() => {
    const code = value.trim();
    if (code.length < 4) {
      setStatus("idle");
      setMessage(null);
      onStatusChangeRef.current?.("idle", null);
      return;
    }

    const timer = setTimeout(async () => {
      setStatus("checking");
      setMessage("Verifying invitation…");
      onStatusChangeRef.current?.("checking", "Verifying invitation…");

      try {
        const res = await fetch("/api/beta/invite/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            email: email?.trim() || undefined,
          }),
        });
        const data = (await res.json()) as { valid?: boolean; error?: string };

        if (data.valid) {
          setStatus("valid");
          setMessage("You're welcome in — complete your account below.");
          onStatusChangeRef.current?.(
            "valid",
            "You're welcome in — complete your account below.",
          );
        } else {
          setStatus("invalid");
          const err = data.error ?? "Invitation code invalid.";
          setMessage(err);
          onStatusChangeRef.current?.("invalid", err);
        }
      } catch {
        setStatus("idle");
        setMessage(null);
        onStatusChangeRef.current?.("idle", null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value, email]);

  const statusClass =
    status === "valid"
      ? "border-amber-gold/40 bg-amber-gold/5 focus:border-amber-gold/60 focus:ring-amber-gold/20"
      : status === "invalid"
        ? "border-red-400/35 bg-red-500/5 focus:border-red-400/50 focus:ring-red-400/15"
        : "border-white/10 bg-zen-elevated/80 focus:border-cosmic-purple/50 focus:ring-cosmic-purple/20";

  return (
    <div className="space-y-2">
      <label htmlFor="invite-code" className="auth-label">
        Invitation code
      </label>
      <input
        id="invite-code"
        name="inviteCode"
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className={`auth-input py-3.5 text-center font-mono text-base tracking-[0.2em] transition-colors sm:text-lg ${statusClass}`}
        placeholder="Enter your invitation code"
        aria-invalid={status === "invalid"}
        aria-describedby="invite-code-status"
      />
      <AnimatePresence mode="wait">
        {message ? (
          <motion.p
            key={message}
            id="invite-code-status"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className={`text-center text-xs leading-relaxed ${
              status === "valid"
                ? "text-amber-glow"
                : status === "invalid"
                  ? "text-red-300"
                  : "text-zen-muted"
            }`}
            role="status"
          >
            {message}
          </motion.p>
        ) : (
          <p
            id="invite-code-status"
            className="text-center text-xs text-zen-muted/80"
          >
            From Reddit, Discord, or a personal invite — enter your code to
            continue.
          </p>
        )}
      </AnimatePresence>
    </div>
  );
}
