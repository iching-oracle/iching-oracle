"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { FeedbackFilterCategory, FeedbackSort } from "@/types/admin-feedback";

const CATEGORIES: Array<{ id: FeedbackFilterCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "bug", label: "Bug reports" },
  { id: "feature", label: "Feature requests" },
  { id: "general", label: "General feedback" },
  { id: "emotional", label: "Emotional reactions" },
];

const SORTS: Array<{ id: FeedbackSort; label: string }> = [
  { id: "newest", label: "Newest first" },
  { id: "rating_asc", label: "Lowest rating" },
  { id: "rating_desc", label: "Highest rating" },
];

type FeedbackFiltersProps = {
  category: FeedbackFilterCategory;
  sort: FeedbackSort;
};

function buildHref(
  pathname: string,
  searchParams: URLSearchParams,
  patch: Record<string, string>,
) {
  const next = new URLSearchParams(searchParams.toString());
  for (const [k, v] of Object.entries(patch)) {
    next.set(k, v);
  }
  if (!patch.page) next.delete("page");
  const q = next.toString();
  return q ? `${pathname}?${q}` : pathname;
}

export function FeedbackFilters({ category, sort }: FeedbackFiltersProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter feedback by category"
      >
        {CATEGORIES.map((item) => {
          const active = category === item.id;
          return (
            <Link
              key={item.id}
              href={buildHref(pathname, searchParams, { category: item.id })}
              role="tab"
              aria-selected={active}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-300 ${
                active
                  ? "bg-amber-gold/15 text-amber-gold"
                  : "border border-white/10 text-zen-muted hover:border-amber-gold/25 hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <label className="flex items-center gap-2 text-xs text-zen-muted">
        <span className="sr-only">Sort feedback</span>
        <span aria-hidden>Sort</span>
        <select
          className="rounded-lg border border-white/10 bg-zen-elevated/80 px-3 py-2 text-sm text-foreground outline-none focus:border-amber-gold/40"
          value={sort}
          onChange={(e) => {
            window.location.href = buildHref(pathname, searchParams, {
              sort: e.target.value,
            });
          }}
        >
          {SORTS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
