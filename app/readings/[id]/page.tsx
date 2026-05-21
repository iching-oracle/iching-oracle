import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { CastingSummary } from "@/components/readings/casting-summary";
import { PremiumInterpretation } from "@/components/readings/premium-interpretation";
import { DeleteReadingDialog } from "@/components/journal/DeleteReadingDialog";
import { ReadingDetailActions } from "@/components/journal/ReadingDetailActions";
import { ReadingDetailHero } from "@/components/journal/ReadingDetailHero";
import { ReadingDetailSections } from "@/components/journal/ReadingDetailSections";
import { FavoriteButton } from "@/components/journal/FavoriteButton";
import { parseChangingLines } from "@/lib/iching";
import { isInterpretationMode } from "@/lib/interpretation/modes";
import { isAdvancedInterpretation } from "@/lib/interpretation/parse";
import { getJournalReadingById } from "@/lib/readings/journal";
import { isLegacyPlaceholderInterpretation } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Reading | Oracle Journal`,
    description: `Saved reading ${id.slice(0, 8)}…`,
  };
}

export default async function ReadingDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/readings");
  }

  const { id } = await params;
  const record = await getJournalReadingById(session.user.id, id);

  if (!record) {
    notFound();
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { premiumUntil: true },
  });

  const { journal } = record;
  const changingLinePositions = parseChangingLines(record.changingLines);
  const isLegacyReading = isLegacyPlaceholderInterpretation(record.interpretation);
  const mode = isInterpretationMode(record.interpretationMode)
    ? record.interpretationMode
    : "traditional";
  const showStructuredSections =
    isAdvancedInterpretation(record.interpretation) &&
    !record.interpretationPending;

  return (
    <div className="relative mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 sm:py-16">
      <div
        className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full bg-cosmic-purple/15 blur-[100px]"
        aria-hidden
      />

      <div className="relative space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/readings"
            className="text-xs font-medium uppercase tracking-widest text-zen-muted transition-colors hover:text-amber-gold"
          >
            ← Journal
          </Link>
          <FavoriteButton
            readingId={id}
            initialFavorite={journal.isFavorite}
          />
        </div>

        <ReadingDetailHero journal={journal} language={record.language} />

        <section className="rounded-2xl border border-amber-gold/20 bg-zen-surface/70 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="text-xs font-medium uppercase tracking-widest text-amber-gold">
            Hexagrams
          </h2>
          <div className="mt-6">
            <CastingSummary
              primaryNumber={record.hexagram}
              transformedNumber={record.transformedHexagram}
              changingLinePositions={changingLinePositions}
              animated
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zen-surface/70 p-6 backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xs font-medium uppercase tracking-widest text-zen-muted">
              Interpretation
            </h2>
            <ReadingDetailActions
              readingId={id}
              interpretation={record.interpretation}
            />
          </div>

          {showStructuredSections ? (
            <ReadingDetailSections
              interpretation={record.interpretation}
              mode={mode}
            />
          ) : (
            <PremiumInterpretation
              user={{ premiumUntil: dbUser?.premiumUntil ?? null }}
              interpretation={record.interpretation}
              readingId={id}
              isLegacyReading={isLegacyReading}
              interpretationPending={record.interpretationPending}
              isPremiumReading={record.isPremiumReading}
            />
          )}
        </section>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/reading/new" className="auth-btn-primary inline-flex text-center">
            New consultation
          </Link>
          <DeleteReadingDialog
            readingId={id}
            questionPreview={journal.question}
          />
        </div>
      </div>
    </div>
  );
}
