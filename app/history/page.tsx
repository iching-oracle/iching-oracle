import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { HistoryEmptyState } from "@/components/HistoryEmptyState";
import { ReadingCard } from "@/components/ReadingCard";
import { getReadingHistoryForUser } from "@/lib/readings/history";

export const metadata = {
  title: "Reading History | ICHING-ORACLE",
  description: "Your past I Ching oracle consultations",
};

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 7v14" />
      <path d="M5.5 4.5A2.5 2.5 0 0 0 3 7v13h9" />
      <path d="M18.5 4.5A2.5 2.5 0 0 1 21 7v13h-9" />
    </svg>
  );
}

export default async function HistoryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/history");
  }

  const readings = await getReadingHistoryForUser(session.user.id);

  return (
    <div className="relative mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 sm:py-16">
      <div
        className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full bg-cosmic-purple/15 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-amber-gold/10 blur-[90px]"
        aria-hidden
      />

      <div className="relative space-y-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-cosmic-violet">
              <BookOpenIcon className="h-4 w-4" />
              Reading History
            </p>
            <h1 className="mt-2 bg-gradient-to-r from-amber-gold via-amber-glow to-cosmic-violet bg-clip-text font-serif text-3xl font-semibold text-transparent sm:text-4xl">
              Your Oracle Journey
            </h1>
            <p className="mt-2 text-sm text-zen-muted">
              {readings.length > 0
                ? `${readings.length} saved consultation${readings.length === 1 ? "" : "s"}`
                : "No readings yet"}
            </p>
          </div>
          <Link href="/reading/new" className="auth-btn-primary shrink-0 text-center">
            New Reading
          </Link>
        </div>

        {readings.length === 0 ? (
          <HistoryEmptyState />
        ) : (
          <ul className="space-y-4">
            {readings.map((reading) => (
              <li key={reading.id}>
                <ReadingCard reading={reading} />
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/dashboard"
          className="inline-block text-sm text-zen-muted transition-colors hover:text-amber-gold"
        >
          ← Dashboard
        </Link>
      </div>
    </div>
  );
}
