"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PasswordField } from "@/components/password-field";
import { showError, showRateLimit, showSuccess } from "@/hooks/use-app-toast";
import {
  getPasswordRuleStatuses,
  passwordsMatch,
} from "@/lib/password";
import { resetPasswordSchema } from "@/lib/validations/auth";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordRules = useMemo(
    () => getPasswordRuleStatuses(password),
    [password],
  );

  const allPasswordRulesPass = passwordRules.every((rule) => rule.passed);
  const confirmMatches = passwordsMatch(password, confirmPassword);

  const canSubmit = useMemo(() => {
    const parsed = resetPasswordSchema.safeParse({
      token,
      password,
      confirmPassword,
    });
    return parsed.success && !isLoading;
  }, [token, password, confirmPassword, isLoading]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const parsed = resetPasswordSchema.safeParse({
      token,
      password,
      confirmPassword,
    });

    if (!parsed.success) {
      showError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = (await res.json()) as {
        error?: string;
        message?: string;
        code?: string;
      };

      if (res.status === 429) {
        showRateLimit(data.error);
        return;
      }

      if (!res.ok) {
        showError(data.error ?? "Could not reset password.");
        return;
      }

      showSuccess(data.message ?? "Your password has been updated.");
      router.push("/login?reset=success");
      router.refresh();
    } catch {
      showError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordField
          label="New password"
          name="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          placeholder="Create a strong password"
          disabled={isLoading}
        />

        <ul className="space-y-1.5 rounded-lg border border-white/8 bg-black/20 px-3 py-2.5">
          {passwordRules.map((rule) => (
            <li
              key={rule.id}
              className={`flex items-center gap-2 text-xs ${
                rule.passed ? "text-emerald-300/90" : "text-zen-muted"
              }`}
            >
              <span aria-hidden>{rule.passed ? "✓" : "○"}</span>
              {rule.label}
            </li>
          ))}
        </ul>

        <PasswordField
          label="Confirm new password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          placeholder="Repeat your password"
          disabled={isLoading}
        />

        {confirmPassword.length > 0 && !confirmMatches ? (
          <p className="text-xs text-red-300">Passwords do not match.</p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit || !allPasswordRulesPass}
          className="auth-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Updating…" : "Update password"}
        </button>
      </form>

      <p className="text-center text-sm text-zen-muted">
        <Link
          href="/forgot-password"
          className="font-medium text-amber-gold transition-colors hover:text-amber-glow"
        >
          Request a new reset link
        </Link>
      </p>
    </div>
  );
}
