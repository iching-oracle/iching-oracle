import { Suspense } from "react";
import { AuthAmbient } from "@/components/auth-ambient";
import { AuthGlassCard } from "@/components/auth-glass-card";
import { RegisterForm } from "@/components/register-form";

export const metadata = {
  title: "Register | ICHING-ORACLE",
  description: "Create your I-Ching oracle account",
};

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center px-6 py-16">
      <AuthAmbient />
      <AuthGlassCard
        title="Begin your path"
        subtitle="Register with your beta invite to join the early explorer community."
      >
        <Suspense fallback={<p className="text-sm text-zen-muted">Loading…</p>}>
          <RegisterForm />
        </Suspense>
      </AuthGlassCard>
    </div>
  );
}
