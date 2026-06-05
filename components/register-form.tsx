"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { InviteCodeField } from "@/components/beta/invite-code-field";
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

type FieldErrors = {
  name?: string;
  email?: string;
  inviteCode?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

function mapApiField(field?: string): keyof FieldErrors | "form" {
  if (field === "inviteCode" || field === "email" || field === "name") {
    return field;
  }
  return "form";
}

export function RegisterForm({
  inviteRequired = false,
  initialInviteCode = "",
  autoFocusInvite = false,
}: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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

  const canSubmit = useMemo(() => {
    if (isLoading) return false;
    if (inviteRequired && inviteCode.trim().length < 4) return false;
    return true;
  }, [isLoading, inviteRequired, inviteCode]);

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = registerSchema.safeParse({
      name: name.trim() || undefined,
      email,
      password,
      confirmPassword,
      inviteCode: inviteCode.trim() || undefined,
    });

    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = (issue.path[0] as keyof FieldErrors) ?? "form";
        if (!next[key]) next[key] = issue.message;
      }
      if (inviteRequired && !inviteCode.trim()) {
        next.inviteCode = "Please enter your invitation.";
      }
      setFieldErrors(next);
      return;
    }

    if (inviteRequired && !inviteCode.trim()) {
      setFieldErrors({ inviteCode: "Please enter your invitation." });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          name: name.trim() || undefined,
          inviteCode: inviteCode.trim() || undefined,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        field?: string;
        message?: string;
      };

      if (!res.ok) {
        const target = mapApiField(data.field);
        setFieldErrors({
          [target]: data.error ?? "Registration could not be completed.",
        });
        return;
      }

      setSuccessMessage(
        data.message ??
          "Your account is ready. Check your email for a quiet confirmation link.",
      );
      setName("");
      setEmail("");
      setInviteCode("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setFieldErrors({
        form: "Something went wrong. Please try again in a moment.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (successMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        className="space-y-6 text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-amber-gold/30 bg-amber-gold/10">
          <span className="text-lg text-amber-glow" aria-hidden>
            ✓
          </span>
        </div>
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
          Continue to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="auth-label">
            Display name <span className="text-zen-muted/60">(optional)</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearFieldError("name");
            }}
            className={`auth-input ${fieldErrors.name ? "border-red-400/35 bg-red-500/5" : ""}`}
            placeholder="How we may greet you"
            disabled={isLoading}
            aria-invalid={Boolean(fieldErrors.name)}
          />
          {fieldErrors.name ? (
            <p className="mt-1 text-xs text-red-300" role="alert">
              {fieldErrors.name}
            </p>
          ) : null}
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
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError("email");
            }}
            className={`auth-input ${fieldErrors.email ? "border-red-400/35 bg-red-500/5" : ""}`}
            placeholder="you@example.com"
            disabled={isLoading}
            aria-invalid={Boolean(fieldErrors.email)}
          />
          {fieldErrors.email ? (
            <p className="mt-1 text-xs text-red-300" role="alert">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <PasswordField
          id="password"
          label="Password"
          name="password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            clearFieldError("password");
          }}
          placeholder="Create a password"
          disabled={isLoading}
          describedBy="password-requirements"
        />
        {fieldErrors.password ? (
          <p className="text-xs text-red-300" role="alert">
            {fieldErrors.password}
          </p>
        ) : null}

        <ul
          id="password-requirements"
          className="space-y-1 rounded-lg border border-white/10 bg-zen-elevated/40 px-3 py-2.5 text-sm"
          aria-live="polite"
        >
          {passwordRules.map((rule) => (
            <li
              key={rule.id}
              className={rule.passed ? "text-amber-glow" : "text-zen-muted"}
            >
              <span aria-hidden>{rule.passed ? "✓" : "○"}</span> {rule.label}
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
          onChange={(value) => {
            setConfirmPassword(value);
            clearFieldError("confirmPassword");
          }}
          placeholder="Repeat your password"
          disabled={isLoading}
        />
        {fieldErrors.confirmPassword ? (
          <p className="text-xs text-red-300" role="alert">
            {fieldErrors.confirmPassword}
          </p>
        ) : confirmPassword.length > 0 && !confirmMatches ? (
          <p className="text-xs text-red-300" role="alert">
            Passwords do not match.
          </p>
        ) : null}

        {inviteRequired ? (
          <InviteCodeField
            value={inviteCode}
            onChange={(value) => {
              setInviteCode(value);
              clearFieldError("inviteCode");
            }}
            error={fieldErrors.inviteCode}
            autoFocus={autoFocusInvite && !email}
            disabled={isLoading}
          />
        ) : null}

        {fieldErrors.form ? (
          <p
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            role="alert"
          >
            {fieldErrors.form}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="auth-btn-primary w-full min-h-12 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-zen-bg/30 border-t-zen-bg"
                aria-hidden
              />
              Creating your space…
            </span>
          ) : (
            "Begin"
          )}
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
