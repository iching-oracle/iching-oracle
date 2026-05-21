import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OracleHistoryTimeline } from "@/components/daily/OracleHistoryTimeline";
import { getDailyOracleHistory } from "@/lib/daily-oracle/service";

export const metadata = {
  title: "Daily Oracle History | ICHING-ORACLE",
};

export default async function DailyOracleHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/daily/history");
  }

  const history = await getDailyOracleHistory(session.user.id, 60);

  return (
    <div className="relative min-h-full bg-zen-bg">
      <div
        className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-cosmic-purple/15 blur-[100px]"
        aria-hidden
      />
      <main className="relative z-10 mx-auto max-w-2xl px-6 py-12 sm:px-10 sm:py-16">
        <Link
          href="/daily"
          className="text-xs uppercase tracking-widest text-zen-muted transition-colors hover:text-amber-gold"
        >
          ← Today&apos;s oracle
        </Link>
        <header className="mt-6">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-cosmic-violet">
            Archive
          </p>
          <h1 className="mt-2 font-serif text-3xl text-foreground">
            Daily oracle history
          </h1>
          <p className="mt-2 text-sm text-zen-muted">
            Revisit past days and star the readings that stayed with you.
          </p>
        </header>
        <div className="mt-10">
          <OracleHistoryTimeline initialHistory={history} />
        </div>
      </main>
    </div>
  );
}
