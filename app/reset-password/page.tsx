import Link from "next/link";
import { AuthAmbient } from "@/components/auth-ambient";
import { AuthGlassCard } from "@/components/auth-glass-card";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { validatePasswordResetToken } from "@/lib/auth/password-reset";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export const metadata = {
  title: "Reset Password | ICHING-ORACLE",
  description: "Choose a new password for your I Ching Oracle account",
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  const status = await validatePasswordResetToken(token);

  if (status.valid) {
    return (
      <div className="relative flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center px-6 py-16">
        <AuthAmbient />
        <AuthGlassCard
          title="Choose a new password"
          subtitle="Create a strong password to secure your oracle account."
        >
          <ResetPasswordForm token={token!.trim()} />
        </AuthGlassCard>
      </div>
    );
  }

  const errorMessages = {
    missing: "No reset token was provided.",
    invalid: "This reset link is invalid or has already been used.",
    expired: "This reset link has expired.",
  } as const;

  const message = errorMessages[status.error];

  return (
    <div className="relative flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center px-6 py-16">
      <AuthAmbient />
      <AuthGlassCard title="Reset link unavailable" subtitle={message}>
        <div className="space-y-4 text-center">
          <p className="text-sm leading-relaxed text-zen-muted">
            Password reset links expire after one hour and can only be used once.
            Request a new link to continue.
          </p>
          <Link
            href="/forgot-password"
            className="auth-btn-primary inline-block w-full text-center"
          >
            Request new reset email
          </Link>
          <Link
            href="/login"
            className="block text-sm text-amber-gold transition-colors hover:text-amber-glow"
          >
            Back to sign in
          </Link>
        </div>
      </AuthGlassCard>
    </div>
  );
}
