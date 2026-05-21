"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { JournalEmptyState } from "@/components/journal/JournalEmptyState";
import { ReadingFilters, type FilterState } from "@/components/journal/ReadingFilters";
import { ReadingGrid } from "@/components/journal/ReadingGrid";
import { ReadingSearchBar } from "@/components/journal/ReadingSearchBar";
import { ReadingTimeline } from "@/components/journal/ReadingTimeline";
import { isInterpretationMode } from "@/lib/interpretation/modes";
import { isReadingCategory } from "@/lib/readings/category";
import type { ReadingJournalResult } from "@/types/reading-journal";

type ReadingJournalClientProps = {
  initialData: ReadingJournalResult;
  locale?: string;
};

function parseFiltersFromParams(params: URLSearchParams): FilterState {
  const categoryParam = params.get("category") ?? "all";
  const modeParam = params.get("mode") ?? "all";

  return {
    q: params.get("q") ?? "",
    category: isReadingCategory(categoryParam) ? categoryParam : "all",
    mode: isInterpretationMode(modeParam) ? modeParam : "all",
    favorite: params.get("favorite") === "true",
    sort: params.get("sort") === "asc" ? "asc" : "desc",
    view: params.get("view") === "timeline" ? "timeline" : "grid",
  };
}

function buildSearchParams(filters: FilterState, page: number): string {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.mode !== "all") params.set("mode", filters.mode);
  if (filters.favorite) params.set("favorite", "true");
  if (filters.sort === "asc") params.set("sort", "asc");
  if (filters.view === "timeline") params.set("view", "timeline");
  if (page > 1) params.set("page", String(page));
  return params.toString();
}

export function ReadingJournalClient({
  initialData,
  locale,
}: ReadingJournalClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(() =>
    parseFiltersFromParams(searchParams),
  );

  const applyFilters = useCallback(
    (next: FilterState, page = 1) => {
      const qs = buildSearchParams(next, page);
      router.push(qs ? `/readings?${qs}` : "/readings");
    },
    [router],
  );

  const hasActiveFilters =
    filters.q.trim() ||
    filters.category !== "all" ||
    filters.mode !== "all" ||
    filters.favorite;

  return (
    <div className="space-y-6">
      <ReadingSearchBar
        value={filters.q}
        onChange={(q) => setFilters((f) => ({ ...f, q }))}
        onSubmit={() => applyFilters(filters, 1)}
      />

      <ReadingFilters
        filters={filters}
        onChange={setFilters}
        onApply={() => applyFilters(filters, 1)}
      />

      {initialData.items.length === 0 ? (
        <JournalEmptyState filtered={Boolean(hasActiveFilters)} />
      ) : filters.view === "timeline" ? (
        <ReadingTimeline readings={initialData.items} locale={locale} />
      ) : (
        <ReadingGrid readings={initialData.items} locale={locale} />
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
