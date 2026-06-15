import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { ReadingJournalClient } from "@/components/journal/ReadingJournalClient";
import { ReadingJournalSkeleton } from "@/components/journal/ReadingCardSkeleton";
import { localeForLanguage } from "@/lib/i18n/languages";
import { isInterpretationMode } from "@/lib/interpretation/modes";
import { isReadingCategory } from "@/lib/readings/category";
import { queryReadingsForUser } from "@/lib/readings/journal";
import { getPreferredLanguageForUser } from "@/lib/user/preferred-language";
import type {
  ReadingHistoryPeriod,
  ReadingJournalQuery,
} from "@/types/reading-journal";

import { buildNoIndexMetadata } from "@/lib/seo/noindex-metadata";

export const metadata = buildNoIndexMetadata({
  title: "Reading history",
  description: "Your saved I Ching readings and interpretations.",
  path: "/history",
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = params[key];
  return typeof v === "string" ? v : undefined;
}

function parsePeriod(value: string | undefined): ReadingHistoryPeriod {
  if (
    value === "favorites" ||
    value === "week" ||
    value === "month" ||
    value === "all"
  ) {
    return value;
  }
  return "all";
}

export default async function HistoryPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/history");
  }

  const params = await searchParams;
  const categoryParam = getParam(params, "category");
  const modeParam = getParam(params, "mode");
  const period = parsePeriod(getParam(params, "period"));

  const query: ReadingJournalQuery = {
    q: getParam(params, "q"),
    category:
      categoryParam && isReadingCategory(categoryParam) ? categoryParam : "all",
    mode: modeParam && isInterpretationMode(modeParam) ? modeParam : "all",
    period:
      period === "all" && getParam(params, "favorite") === "true"
        ? "favorites"
        : period,
    sort: getParam(params, "sort") === "asc" ? "asc" : "desc",
    page: Math.max(1, parseInt(getParam(params, "page") ?? "1", 10) || 1),
  };

  const [data, preferredLanguage] = await Promise.all([
    queryReadingsForUser(session.user.id, query),
    getPreferredLanguageForUser(session.user.id),
  ]);

  const dateLocale = localeForLanguage(preferredLanguage);

  return (
    <div className="mobile-page relative max-w-6xl">
      <div
        className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-cosmic-purple/15 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-amber-gold/10 blur-[90px]"
        aria-hidden
      />

      <div className="relative space-y-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-cosmic-violet">
              Reading History
            </p>
            <h1 className="mt-2 bg-gradient-to-r from-amber-gold via-amber-glow to-cosmic-violet bg-clip-text font-serif text-3xl font-semibold text-transparent sm:text-4xl">
              Saved readings
            </h1>
            <p className="mt-2 text-sm text-zen-muted">
              {data.total > 0
                ? `${data.total} saved reading${data.total === 1 ? "" : "s"} — revisit questions, hexagrams, and insight`
                : "Your personal record of oracle consultations"}
            </p>
          </div>
          <Link href="/reading/new" className="auth-btn-primary shrink-0 text-center">
            New reading
          </Link>
        </div>

        <Suspense fallback={<ReadingJournalSkeleton />}>
          <ReadingJournalClient
            initialData={data}
            locale={dateLocale}
            basePath="/history"
          />
        </Suspense>

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
