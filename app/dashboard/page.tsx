import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ReadingList } from "@/components/dashboard/reading-list";
import { handleSignOut } from "@/lib/actions/auth";
import { getDashboardData } from "@/lib/dashboard/get-dashboard-data";

export const metadata = {
  title: "Dashboard | ICHING-ORACLE",
  description: "Your I-Ching oracle dashboard",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const data = await getDashboardData(session.user.id);

  if (!data) {
    redirect("/login");
  }

  const { user, readings } = data;
  const displayName = user.name?.trim() || "Seeker";

  return (
    <div className="relative mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 sm:py-16">
      <div
        className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-cosmic-purple/15 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-amber-gold/10 blur-[90px]"
        aria-hidden
      />

      <div className="relative space-y-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-cosmic-violet">
              Dashboard
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              Welcome, {displayName}
            </h1>
          </div>
          <Link href="/reading/new" className="auth-btn-primary shrink-0 text-center">
            New Reading
          </Link>
        </div>

        <section className="rounded-2xl border border-white/10 bg-zen-surface/70 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="sr-only">Account</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-widest text-zen-muted">
                Name
              </dt>
              <dd className="mt-1 text-lg text-foreground">{user.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-widest text-zen-muted">
                Email
              </dt>
              <dd className="mt-1 text-lg text-foreground">{user.email}</dd>
            </div>
          </dl>
          <form action={handleSignOut} className="mt-6 border-t border-white/10 pt-6">
            <button
              type="submit"
              className="text-sm text-zen-muted transition-colors hover:text-amber-gold"
            >
              Sign out
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
            Recent readings
          </h2>
          <p className="mb-4 text-sm text-zen-muted">
            Your 10 most recent consultations.
          </p>
          <ReadingList readings={readings} />
        </section>

        <Link
          href="/"
          className="inline-block text-sm text-zen-muted transition-colors hover:text-amber-gold"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
