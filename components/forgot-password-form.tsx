"use client";

import Link from "next/link";
import { useState } from "react";
import { showError, showRateLimit, showSuccess } from "@/hooks/use-app-toast";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      showError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parsed.data.email }),
      });

      const data = (await res.json()) as { error?: string; message?: string };

      if (res.status === 429) {
        showRateLimit(data.error);
        return;
      }

      if (!res.ok) {
        showError(data.error ?? "Could not send reset email. Please try again.");
        return;
      }

      setSubmitted(true);
      showSuccess(
        data.message ??
          "If an account with that email exists, we have sent a password reset link.",
      );
    } catch {
      showError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <p className="rounded-lg border border-amber-gold/30 bg-amber-gold/10 px-4 py-3 text-sm leading-relaxed text-amber-glow">
          If an account with that email exists, we have sent a password reset link.
          Check your inbox and spam folder — the link expires in one hour.
        </p>
        <Link href="/login" className="auth-btn-primary inline-block w-full text-center">
          Back to sign in
        </Link>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="w-full text-sm text-amber-gold transition-colors hover:text-amber-glow"
        >
          Send another email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-center text-sm leading-relaxed text-zen-muted">
        Enter the email address for your account. We will send you a secure link to
        reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <button type="submit" disabled={isLoading} className="auth-btn-primary w-full">
          {isLoading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="text-center text-sm text-zen-muted">
        Remember your password?{" "}
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
