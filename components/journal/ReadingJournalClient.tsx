"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { JournalEmptyState } from "@/components/journal/JournalEmptyState";
import { HistoryPeriodTabs } from "@/components/journal/HistoryPeriodTabs";
import { ReadingFilters, type FilterState } from "@/components/journal/ReadingFilters";
import { ReadingGrid } from "@/components/journal/ReadingGrid";
import { ReadingSearchBar } from "@/components/journal/ReadingSearchBar";
import { ReadingTimeline } from "@/components/journal/ReadingTimeline";
import { isInterpretationMode } from "@/lib/interpretation/modes";
import { isReadingCategory } from "@/lib/readings/category";
import type {
  ReadingHistoryPeriod,
  ReadingJournalResult,
} from "@/types/reading-journal";

type ReadingJournalClientProps = {
  initialData: ReadingJournalResult;
  locale?: string;
  basePath?: string;
};

function parsePeriod(
  params: URLSearchParams,
): ReadingHistoryPeriod {
  const period = params.get("period");
  if (
    period === "favorites" ||
    period === "week" ||
    period === "month" ||
    period === "all"
  ) {
    return period;
  }
  if (params.get("favorite") === "true") return "favorites";
  return "all";
}

function parseFiltersFromParams(params: URLSearchParams): FilterState {
  const categoryParam = params.get("category") ?? "all";
  const modeParam = params.get("mode") ?? "all";

  return {
    q: params.get("q") ?? "",
    category: isReadingCategory(categoryParam) ? categoryParam : "all",
    mode: isInterpretationMode(modeParam) ? modeParam : "all",
    period: parsePeriod(params),
    sort: params.get("sort") === "asc" ? "asc" : "desc",
    view: params.get("view") === "timeline" ? "timeline" : "grid",
  };
}

function buildSearchParams(filters: FilterState, page: number): string {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.mode !== "all") params.set("mode", filters.mode);
  if (filters.period !== "all") params.set("period", filters.period);
  if (filters.sort === "asc") params.set("sort", "asc");
  if (filters.view === "timeline") params.set("view", "timeline");
  if (page > 1) params.set("page", String(page));
  return params.toString();
}

export function ReadingJournalClient({
  initialData,
  locale,
  basePath = "/history",
}: ReadingJournalClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(() =>
    parseFiltersFromParams(searchParams),
  );

  const applyFilters = useCallback(
    (next: FilterState, page = 1) => {
      const qs = buildSearchParams(next, page);
      router.push(qs ? `${basePath}?${qs}` : basePath);
    },
    [router],
  );

  const hasActiveFilters =
    filters.q.trim() ||
    filters.category !== "all" ||
    filters.mode !== "all" ||
    filters.period !== "all";

  return (
    <div className="space-y-6">
      <ReadingSearchBar
        value={filters.q}
        onChange={(q) => setFilters((f) => ({ ...f, q }))}
        onSubmit={() => applyFilters(filters, 1)}
      />

      <HistoryPeriodTabs
        period={filters.period}
        onChange={(period) => setFilters((f) => ({ ...f, period }))}
        onApply={(period) => applyFilters({ ...filters, period }, 1)}
      />

      <ReadingFilters
        filters={filters}
        onChange={setFilters}
        onApply={() => applyFilters(filters, 1)}
      />

      {initialData.historyLimited ? (
        <p className="rounded-xl border border-amber-gold/25 bg-amber-gold/10 px-4 py-3 text-sm text-amber-glow">
          Free plan shows your 30 most recent readings.{" "}
          <a href="/pricing" className="font-medium underline underline-offset-2">
            Upgrade to Premium
          </a>{" "}
          for full history.
        </p>
      ) : null}

      {initialData.items.length === 0 ? (
        <JournalEmptyState filtered={Boolean(hasActiveFilters)} />
      ) : filters.view === "timeline" ? (
        <ReadingTimeline
          readings={initialData.items}
          locale={locale}
          detailBase={basePath}
        />
      ) : (
        <ReadingGrid
          readings={initialData.items}
          locale={locale}
          detailBase={basePath}
        />
      )}

      {initialData.totalPages > 1 ? (
        <nav
          className="flex items-center justify-center gap-3 pt-4"
          aria-label="Pagination"
        >
          <button
            type="button"
            disabled={initialData.page <= 1}
            onClick={() => applyFilters(filters, initialData.page - 1)}
            className="auth-btn-secondary text-xs disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-zen-muted">
            Page {initialData.page} of {initialData.totalPages}
          </span>
          <button
            type="button"
            disabled={initialData.page >= initialData.totalPages}
            onClick={() => applyFilters(filters, initialData.page + 1)}
            className="auth-btn-secondary text-xs disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  );
}
