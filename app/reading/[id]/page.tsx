import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  generatePublicReadingMetadata,
  PublicSeoReadingPage,
} from "@/app/reading/[id]/public-seo-page";
import { CastingSummary } from "@/components/readings/casting-summary";
import { getReadingForUser } from "@/lib/data/get-reading-for-user";
import { parseChangingLines } from "@/lib/iching";
import { formatHexagramInline, getHexagram } from "@/lib/hexagrams";
import { MobilePage } from "@/components/mobile/mobile-page";
import { FadeIn } from "@/components/mobile/motion";
import { PremiumInterpretation } from "@/components/readings/premium-interpretation";
import { formatDateTimeForLanguage } from "@/lib/format-date";
import { isLegacyPlaceholderInterpretation } from "@/lib/openai";
import { isPrivateReadingId } from "@/lib/seo/slugs";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  if (!isPrivateReadingId(id)) {
    const meta = await generatePublicReadingMetadata(id);
    if (meta) return meta;
  }
  return {
    title: `Reading | ICHING-ORACLE`,
    description: `Oracle reading ${id.slice(0, 8)}…`,
    robots: { index: false, follow: false },
  };
}

export default async function ReadingPage({ params }: PageProps) {
  const { id } = await params;

  if (!isPrivateReadingId(id)) {
    return <PublicSeoReadingPage slug={id} />;
  }

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/reading/new");
  }
  const reading = await getReadingForUser(session.user.id, id);

  if (!reading) {
    notFound();
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { premiumUntil: true },
  });

  const primaryHexagram = getHexagram(reading.hexagram);
  const transformedHexagram = reading.transformedHexagram
    ? getHexagram(reading.transformedHexagram)
    : null;
  const changingLinePositions = parseChangingLines(reading.changingLines);
  const isLegacyReading = isLegacyPlaceholderInterpretation(
    reading.interpretation,
  );

  const createdAt = formatDateTimeForLanguage(
    reading.createdAt,
    reading.language,
  );

  return (
    <MobilePage reading focus className="relative">
      <div
        className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full bg-cosmic-purple/15 blur-[100px]"
        aria-hidden
      />

      <div className="relative space-y-5 sm:space-y-6">
        <Link
          href="/history"
          className="tap-feedback inline-block text-xs font-medium uppercase tracking-widest text-zen-muted transition-colors hover:text-amber-gold max-md:hidden"
        >
          ← History
        </Link>

        <FadeIn>
          <header>
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-cosmic-violet">
              Your Reading
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zen-muted">
              本卦：{formatHexagramInline(primaryHexagram)}
              {transformedHexagram
                ? ` · 變卦：${formatHexagramInline(transformedHexagram)}`
                : null}
            </p>
          </header>
        </FadeIn>

        <FadeIn delay={0.05}>
          <section className="ritual-card">
            <h2 className="text-[10px] font-medium uppercase tracking-widest text-zen-muted">
              Question
            </h2>
            <p className="reading-prose mt-3 font-serif text-xl sm:text-2xl">
              {reading.question}
            </p>
          </section>
        </FadeIn>

        <FadeIn delay={0.1}>
          <section className="ritual-card border-amber-gold/20">
            <h2 className="text-[10px] font-medium uppercase tracking-widest text-amber-gold">
              Hexagrams
            </h2>
            <div className="mt-5">
              <CastingSummary
                primaryNumber={reading.hexagram}
                transformedNumber={reading.transformedHexagram}
                changingLinePositions={changingLinePositions}
                animated
              />
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.15}>
          <section className="ritual-card">
            <h2 className="text-[10px] font-medium uppercase tracking-widest text-zen-muted">
              Interpretation
            </h2>
            <div className="reading-prose mt-4">
              <PremiumInterpretation
                user={{ premiumUntil: dbUser?.premiumUntil ?? null }}
                interpretation={reading.interpretation}
                readingId={reading.id}
                isLegacyReading={isLegacyReading}
                interpretationPending={reading.interpretationPending}
                isPremiumReading={reading.isPremiumReading}
              />
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.2}>
          <section className="ritual-card py-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-zen-muted">
              Created
            </p>
            <p className="mt-2 text-sm text-foreground/90">{createdAt}</p>
          </section>
        </FadeIn>

        <Link
          href="/reading/guided"
          className="auth-btn-primary tap-feedback inline-flex w-full justify-center sm:w-auto"
        >
          New reading
        </Link>
      </div>
    </MobilePage>
  );
}
