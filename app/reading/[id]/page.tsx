import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getReadingForUser } from "@/lib/data/get-reading-for-user";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Reading | ICHING-ORACLE`,
    description: `Oracle reading ${id.slice(0, 8)}`,
  };
}

export default async function ReadingPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/reading/new");
  }

  const { id } = await params;
  const reading = await getReadingForUser(session.user.id, id);

  if (!reading) {
    notFound();
  }

  const createdAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(reading.createdAt);

  return (
    <div className="relative mx-auto w-full max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
      <div
        className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full bg-cosmic-purple/15 blur-[100px]"
        aria-hidden
      />

      <div className="relative space-y-6">
        <Link
          href="/dashboard"
          className="text-xs font-medium uppercase tracking-widest text-zen-muted transition-colors hover:text-amber-gold"
        >
          ← Dashboard
        </Link>

        <header>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-cosmic-violet">
            Your Reading
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-zen-surface/70 p-6 backdrop-blur-xl">
          <h2 className="text-xs font-medium uppercase tracking-widest text-zen-muted">
            Question
          </h2>
          <p className="mt-3 font-serif text-xl leading-relaxed text-foreground">
            {reading.question}
          </p>
        </section>

        <section className="rounded-2xl border border-amber-gold/20 bg-zen-surface/70 p-6 backdrop-blur-xl">
          <h2 className="text-xs font-medium uppercase tracking-widest text-amber-gold">
            Hexagram
          </h2>
          <p className="mt-3 font-serif text-4xl font-light text-foreground">
            {reading.hexagram}
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zen-surface/70 p-6 backdrop-blur-xl">
          <h2 className="text-xs font-medium uppercase tracking-widest text-zen-muted">
            Interpretation
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            {reading.interpretation}
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zen-surface/50 px-6 py-4 backdrop-blur-xl">
          <h2 className="text-xs font-medium uppercase tracking-widest text-zen-muted">
            Created
          </h2>
          <p className="mt-2 text-sm text-foreground">{createdAt}</p>
        </section>

        <Link href="/reading/new" className="auth-btn-primary inline-flex">
          Consult the Oracle again
        </Link>
      </div>
    </div>
  );
}
