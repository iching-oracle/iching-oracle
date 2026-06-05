"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  InviteCodeField,
  type InviteCodeStatus,
} from "@/components/beta/invite-code-field";
import { PasswordField } from "@/components/password-field";
import {
  getPasswordRuleStatuses,
  passwordsMatch,
} from "@/lib/password";
import { registerSchema } from "@/lib/validations/auth";

type RegisterFormProps = {
  inviteRequired?: boolean;
  initialInviteCode?: string;
  autoFocusInvite?: boolean;
};

export function RegisterForm({
  inviteRequired = false,
  initialInviteCode = "",
  autoFocusInvite = false,
}: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [inviteStatus, setInviteStatus] = useState<InviteCodeStatus>("idle");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialInviteCode) setInviteCode(initialInviteCode);
  }, [initialInviteCode]);

  const passwordRules = useMemo(
    () => getPasswordRuleStatuses(password),
    [password],
  );

  const confirmMatches = passwordsMatch(password, confirmPassword);
  const inviteUnlocked = !inviteRequired || inviteStatus === "valid";
  const showOptionalInvite = !inviteRequired && !initialInviteCode;

  const canSubmit = useMemo(() => {
    const parsed = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      inviteCode: inviteCode.trim() || undefined,
    });
    const inviteOk =
      !inviteRequired ||
      (inviteCode.trim().length > 0 && inviteStatus === "valid");
    return (
      parsed.success && inviteOk && inviteUnlocked && !isLoading
    );
  }, [
    name,
    email,
    password,
    confirmPassword,
    inviteCode,
    isLoading,
    inviteRequired,
    inviteStatus,
    inviteUnlocked,
  ]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const parsed = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      inviteCode: inviteCode.trim() || undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    if (inviteRequired && inviteStatus !== "valid") {
      setError("Please enter a valid invitation code to continue.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          inviteCode: inviteCode.trim() || undefined,
        }),
      });

      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        return;
      }

      setSuccessMessage(
        data.message ??
          "Please check your email and click the verification link to activate your account.",
      );
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (successMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 text-center"
      >
        <p className="rounded-lg border border-amber-gold/30 bg-amber-gold/10 px-4 py-3 text-sm leading-relaxed text-amber-glow">
          {successMessage}
        </p>
        <p className="text-sm text-zen-muted">
          Did not receive the email? Check your spam folder or{" "}
          <Link
            href="/verify-email/resend"
            className="font-medium text-amber-gold transition-colors hover:text-amber-glow"
          >
            resend verification
          </Link>
          .
        </p>
        <Link
          href="/login"
          className="auth-btn-primary inline-block w-full text-center"
        >
          Go to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {inviteRequired ? (
          <InviteCodeField
            value={inviteCode}
            onChange={setInviteCode}
            email={email}
            autoFocus={autoFocusInvite}
            onStatusChange={(status) => setInviteStatus(status)}
          />
        ) : null}

        <AnimatePresence initial={false}>
          {inviteUnlocked ? (
            <motion.div
              key="account-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-4 overflow-hidden"
            >
              <div>
                <label htmlFor="name" className="auth-label">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="auth-label">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  placeholder="you@example.com"
                />
              </div>

              {showOptionalInvite ? (
                <InviteCodeField
                  value={inviteCode}
                  onChange={setInviteCode}
                  email={email}
                />
              ) : null}

              <PasswordField
                id="password"
                label="Password"
                name="password"
                value={password}
                onChange={setPassword}
                placeholder="Create a strong password"
                disabled={isLoading}
                describedBy="password-requirements"
              />

              <ul
                id="password-requirements"
                className="space-y-1 rounded-lg border border-white/10 bg-zen-elevated/40 px-3 py-2.5 text-sm"
                aria-live="polite"
              >
                {passwordRules.map((rule) => (
                  <li
                    key={rule.id}
                    className={
                      rule.passed ? "text-amber-glow" : "text-zen-muted"
                    }
                  >
                    <span aria-hidden>{rule.passed ? "✓" : "○"}</span>{" "}
                    {rule.label}
                  </li>
                ))}
                <li
                  className={
                    confirmMatches && confirmPassword.length > 0
                      ? "text-amber-glow"
                      : "text-zen-muted"
                  }
                >
                  <span aria-hidden>
                    {confirmMatches && confirmPassword.length > 0 ? "✓" : "○"}
                  </span>{" "}
                  Passwords match
                </li>
              </ul>

              <PasswordField
                id="confirm-password"
                label="Confirm password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Repeat your password"
                disabled={isLoading}
              />

              {confirmPassword.length > 0 && !confirmMatches ? (
                <p className="text-sm text-red-300" role="alert">
                  Passwords do not match.
                </p>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {error ? (
          <p
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="auth-btn-primary w-full min-h-12 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading
            ? "Creating account…"
            : inviteRequired && !inviteUnlocked
              ? "Enter a valid code to continue"
              : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-zen-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-amber-gold transition-colors hover:text-amber-glow"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
