import { AuthAmbient } from "@/components/auth-ambient";
import { AuthGlassCard } from "@/components/auth-glass-card";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata = {
  title: "Forgot Password | ICHING-ORACLE",
  description: "Request a password reset link for your I Ching Oracle account",
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center px-6 py-16">
      <AuthAmbient />
      <AuthGlassCard
        title="Forgot password"
        subtitle="心誠則靈 — we will send a secure link to restore access to your account."
      >
        <ForgotPasswordForm />
      </AuthGlassCard>
    </div>
  );
}
