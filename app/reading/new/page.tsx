import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthAmbient } from "@/components/auth-ambient";
import { ConsultOracleForm } from "@/components/readings/consult-oracle-form";

export const metadata = {
  title: "Consult the Oracle | ICHING-ORACLE",
  description: "Pose your question to the I Ching oracle",
};

export default async function NewReadingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/reading/new");
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4.5rem)] flex-col items-center px-6 py-12 sm:py-16">
      <AuthAmbient />
      <div className="relative w-full max-w-lg">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-cosmic-violet">
            New Reading
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">
            Consult the Oracle
          </h1>
          <p className="mt-2 text-sm text-zen-muted">
            心誠則靈 — still your mind and ask one clear question.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zen-surface/70 p-8 shadow-[0_0_60px_-20px_rgba(139,92,246,0.4)] backdrop-blur-xl">
          <ConsultOracleForm />
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-zen-muted transition-colors hover:text-amber-gold"
          >
            ← Back to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
