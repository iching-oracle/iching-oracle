import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { HexagramDisplay } from "@/components/readings/hexagram-display";
import { getReadingForUser } from "@/lib/data/get-reading-for-user";
import { formatHexagramInline, getHexagram } from "@/lib/hexagrams";
import { isLegacyPlaceholderInterpretation } from "@/lib/openai";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Reading | ICHING-ORACLE`,
    description: `Oracle reading ${id.slice(0, 8)}…`,
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

  const hexagramInfo = getHexagram(reading.hexagram);
  const isLegacyReading = isLegacyPlaceholderInterpretation(
    reading.interpretation,
  );

  const createdAt = new Intl.DateTimeFormat("zh-Hant", {
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
          <p className="mt-2 text-sm text-zen-muted">
            {formatHexagramInline(hexagramInfo)}
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

        <section className="rounded-2xl border border-amber-gold/20 bg-zen-surface/70 p-8 backdrop-blur-xl">
          <h2 className="text-xs font-medium uppercase tracking-widest text-amber-gold">
            Hexagram
          </h2>
          <div className="mt-6">
            <HexagramDisplay hexagram={hexagramInfo} variant="detail" />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zen-surface/70 p-6 backdrop-blur-xl">
          <h2 className="text-xs font-medium uppercase tracking-widest text-zen-muted">
            Judgment
          </h2>
          <p className="mt-3 font-serif text-lg leading-relaxed text-foreground/95 italic">
            {hexagramInfo.judgment}
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zen-surface/70 p-6 backdrop-blur-xl">
          <h2 className="text-xs font-medium uppercase tracking-widest text-zen-muted">
            Interpretation
          </h2>
          {isLegacyReading ? (
            <p className="mt-3 rounded-lg border border-amber-gold/30 bg-amber-gold/10 px-3 py-2 text-sm text-amber-glow">
              This reading was saved before AI interpretation was enabled. Consult
              the oracle again for a new reading in Traditional Chinese.
            </p>
          ) : null}
          <div className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
            {reading.interpretation}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zen-surface/50 px-6 py-4 backdrop-blur-xl">
          <h2 className="text-xs font-medium uppercase tracking-widest text-zen-muted">
            Creation date
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
