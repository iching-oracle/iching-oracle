"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { loginSchema } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const configError = searchParams.get("error") === "Configuration";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    configError
      ? "Google sign-in is not configured on the server. Use email/password, or ask the admin to set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET."
      : null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((res) => res.json())
      .then((providers: Record<string, unknown>) => {
        setGoogleEnabled(Boolean(providers.google));
      })
      .catch(() => setGoogleEnabled(false));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: parsed.data.email.toLowerCase(),
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    if (!googleEnabled) {
      setError(
        "Google sign-in is not available. Add AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET to your environment.",
      );
      return;
    }

    setIsGoogleLoading(true);
    setError(null);
    await signIn("google", { redirectTo: callbackUrl });
  }

  return (
    <div className="space-y-6">
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

        <div>
          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            placeholder="••••••••"
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={isLoading} className="auth-btn-primary w-full">
          {isLoading ? "Signing in…" : "Login"}
        </button>
      </form>

      {googleEnabled ? (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-zen-surface/70 px-3 text-zen-muted">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="auth-btn-secondary w-full"
          >
            {isGoogleLoading ? "Redirecting…" : "Continue with Google"}
          </button>
        </>
      ) : null}

      <p className="text-center text-sm text-zen-muted">
        No account?{" "}
        <Link
          href="/register"
          className="font-medium text-amber-gold transition-colors hover:text-amber-glow"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
