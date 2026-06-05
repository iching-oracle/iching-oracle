import { Suspense } from "react";
import { AuthAmbient } from "@/components/auth-ambient";
import { AuthGlassCard } from "@/components/auth-glass-card";
import { RegisterPageContent } from "@/components/beta/register-page-content";
import { isBetaInviteOnly } from "@/lib/beta/config";

export const metadata = {
  title: "Register | ICHING-ORACLE",
  description: "Create your I Ching oracle account",
};

export default function RegisterPage() {
  const inviteOnly = isBetaInviteOnly();

  return (
    <div className="relative flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center px-6 py-16">
      <AuthAmbient />
      <AuthGlassCard
        className="max-w-lg"
        title={inviteOnly ? "Welcome" : "Begin your path"}
        subtitle={
          inviteOnly
            ? "Request access or continue with your invitation code."
            : "Create your account and consult the oracle."
        }
      >
        <Suspense fallback={<p className="text-sm text-zen-muted">Loading…</p>}>
          <RegisterPageContent inviteOnly={inviteOnly} />
        </Suspense>
      </AuthGlassCard>
    </div>
  );
}
