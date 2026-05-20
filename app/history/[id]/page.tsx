import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { CastingSummary } from "@/components/readings/casting-summary";
import { DeleteReadingButton } from "@/components/history/delete-reading-button";
import { PremiumInterpretation } from "@/components/readings/premium-interpretation";
import { formatChangingLines, parseChangingLines } from "@/lib/iching";
import { getReadingForHistoryDetail } from "@/lib/readings/history";
import { formatHexagramInline, getHexagram } from "@/lib/hexagrams";
import { formatDateTime } from "@/lib/format-date";
import { isLegacyPlaceholderInterpretation } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Reading History | ICHING-ORACLE`,
    description: `Saved reading ${id.slice(0, 8)}…`,
  };
}

export default async function HistoryDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/history");
  }

  const { id } = await params;
  const record = await getReadingForHistoryDetail(session.user.id, id);

  if (!record) {
    notFound();
  }

  const { history, interpretation, question, hexagram, transformedHexagram, changingLines } =
    record;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { premiumUntil: true },
  });

  const primaryHexagram = getHexagram(hexagram);
  const changingLinePositions = parseChangingLines(changingLines);
  const isLegacyReading = isLegacyPlaceholderInterpretation(interpretation);

  return (
    <div className="relative mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 sm:py-16">
      <div
        className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full bg-cosmic-purple/15 blur-[100px]"
        aria-hidden
      />

      <div className="relative space-y-6">
        <Link
          href="/history"
          className="text-xs font-medium uppercase tracking-widest text-zen-muted transition-colors hover:text-amber-gold"
        >
          ← History
        </Link>

        <header>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-cosmic-violet">
            Saved Reading
          </p>
          <p className="mt-2 text-sm text-zen-muted">
            本卦：{formatHexagramInline(primaryHexagram)}
            {history.finalHexagramNumber
              ? ` · 變卦：#${history.finalHexagramNumber} ${history.finalHexagramName}`
              : null}
          </p>
          <p className="mt-1 text-sm text-cosmic-violet">
            動爻：{formatChangingLines(changingLinePositions)}
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-zen-surface/70 p-6 backdrop-blur-xl">
          <h2 className="text-xs font-medium uppercase tracking-widest text-zen-muted">
            Question
          </h2>
          <p className="mt-3 font-serif text-xl leading-relaxed text-foreground">
            {question}
          </p>
        </section>

        <section className="rounded-2xl border border-amber-gold/20 bg-zen-surface/70 p-8 backdrop-blur-xl">
          <h2 className="text-xs font-medium uppercase tracking-widest text-amber-gold">
            Hexagrams
          </h2>
          <div className="mt-6">
            <CastingSummary
              primaryNumber={hexagram}
              transformedNumber={transformedHexagram}
              changingLinePositions={changingLinePositions}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zen-surface/70 p-6 backdrop-blur-xl">
          <h2 className="text-xs font-medium uppercase tracking-widest text-zen-muted">
            Interpretation
          </h2>
          <PremiumInterpretation
            user={{ premiumUntil: dbUser?.premiumUntil ?? null }}
            interpretation={interpretation}
            readingId={id}
            isLegacyReading={isLegacyReading}
          />
        </section>

        <section className="rounded-2xl border border-white/10 bg-zen-surface/50 px-6 py-4 backdrop-blur-xl">
          <h2 className="text-xs font-medium uppercase tracking-widest text-zen-muted">
            Creation date
          </h2>
          <p className="mt-2 text-sm text-foreground">
            {formatDateTime(record.createdAt)}
          </p>
        </section>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/reading/new" className="auth-btn-primary inline-flex">
            Consult the Oracle again
          </Link>
          <DeleteReadingButton readingId={id} />
        </div>
      </div>
    </div>
  );
}
