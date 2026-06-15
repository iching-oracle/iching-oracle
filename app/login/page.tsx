import { Suspense } from "react";
import { AuthAmbient } from "@/components/auth-ambient";
import { AuthGlassCard } from "@/components/auth-glass-card";
import { LoginForm } from "@/components/login-form";

import { buildNoIndexMetadata } from "@/lib/seo/noindex-metadata";

export const metadata = buildNoIndexMetadata({
  title: "Sign in",
  description: "Sign in to your I Ching Oracle account.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center px-6 py-16">
      <AuthAmbient />
      <AuthGlassCard
        title="Welcome back"
        subtitle="心誠則靈 — sign in to continue your divination journey."
      >
        <Suspense fallback={<p className="text-center text-sm text-zen-muted">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </AuthGlassCard>
    </div>
  );
}
