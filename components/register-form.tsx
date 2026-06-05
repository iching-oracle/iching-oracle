"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PasswordField } from "@/components/password-field";
import {
  getPasswordRuleStatuses,
  passwordsMatch,
} from "@/lib/password";
import { registerSchema } from "@/lib/validations/auth";

type RegisterFormProps = {
  inviteRequired?: boolean;
};

export function RegisterForm({ inviteRequired = false }: RegisterFormProps) {
  const searchParams = useSearchParams();
  const inviteFromUrl = searchParams.get("invite") ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState(inviteFromUrl);
  const [inviteStatus, setInviteStatus] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");
  const [inviteHint, setInviteHint] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const passwordRules = useMemo(
    () => getPasswordRuleStatuses(password),
    [password],
  );

  const allPasswordRulesPass = passwordRules.every((rule) => rule.passed);
  const confirmMatches = passwordsMatch(password, confirmPassword);

  useEffect(() => {
    const code = inviteCode.trim();
    if (code.length < 6) {
      setInviteStatus("idle");
      setInviteHint(null);
      return;
    }

    const timer = setTimeout(async () => {
      setInviteStatus("checking");
      try {
        const res = await fetch("/api/beta/invite/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            email: email.trim() || undefined,
          }),
        });
        const data = (await res.json()) as { valid?: boolean; error?: string };
        if (data.valid) {
          setInviteStatus("valid");
          setInviteHint("Invitation accepted");
        } else {
          setInviteStatus("invalid");
          setInviteHint(data.error ?? "Invalid invite");
        }
      } catch {
        setInviteStatus("idle");
        setInviteHint(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inviteCode, email]);

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
    return parsed.success && inviteOk && !isLoading;
  }, [
    name,
    email,
    password,
    confirmPassword,
    inviteCode,
    isLoading,
    inviteRequired,
    inviteStatus,
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
      <div className="space-y-6 text-center">
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
        <Link href="/login" className="auth-btn-primary inline-block w-full text-center">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="invite-code" className="auth-label">
            Beta invite code
          </label>
          <input
            id="invite-code"
            name="inviteCode"
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="auth-input font-mono tracking-wider"
            placeholder="QUIETPATH or ORACLE-XXXXXXXX"
            autoComplete="off"
          />
          {inviteHint ? (
            <p
              className={`mt-1 text-xs ${
                inviteStatus === "valid" ? "text-amber-glow" : "text-red-300"
              }`}
              role="status"
            >
              {inviteStatus === "checking" ? "Checking code…" : inviteHint}
            </p>
          ) : (
            <p className="mt-1 text-xs text-zen-muted">
              {inviteRequired ? "Required for closed beta. " : ""}
              <Link href="/beta" className="text-amber-gold hover:underline">
                Join the waitlist
              </Link>
            </p>
          )}
        </div>

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
          className="auth-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? "Creating account…" : "Register"}
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
