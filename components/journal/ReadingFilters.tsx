"use client";

import { INTERPRETATION_MODES } from "@/lib/interpretation/modes";
import { READING_CATEGORIES } from "@/types/reading-journal";
import type {
  InterpretationMode,
} from "@/types/interpretation";
import type {
  ReadingCategory,
  ReadingSortOrder,
  ReadingViewMode,
} from "@/types/reading-journal";

import type { ReadingHistoryPeriod } from "@/types/reading-journal";

export type FilterState = {
  q: string;
  category: ReadingCategory | "all";
  mode: InterpretationMode | "all";
  period: ReadingHistoryPeriod;
  sort: ReadingSortOrder;
  view: ReadingViewMode;
};

type ReadingFiltersProps = {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onApply: () => void;
};

export function ReadingFilters({
  filters,
  onChange,
  onApply,
}: ReadingFiltersProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-zen-surface/60 p-4 backdrop-blur-xl sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border border-white/10 p-0.5">
          {(["grid", "timeline"] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => {
                onChange({ ...filters, view });
                onApply();
              }}
              className={`rounded-full px-3 py-1 text-xs capitalize transition-all ${
                filters.view === view
                  ? "bg-amber-gold/20 text-amber-glow"
                  : "text-zen-muted hover:text-foreground"
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-xs text-zen-muted">
          Category
          <select
            value={filters.category}
            onChange={(e) =>
              onChange({
                ...filters,
                category: e.target.value as FilterState["category"],
              })
            }
            className="auth-input mt-1 w-full text-sm"
          >
            <option value="all">All categories</option>
            {READING_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-zen-muted">
          Interpretation mode
          <select
            value={filters.mode}
            onChange={(e) =>
              onChange({
                ...filters,
                mode: e.target.value as FilterState["mode"],
              })
            }
            className="auth-input mt-1 w-full text-sm"
          >
            <option value="all">All modes</option>
            {INTERPRETATION_MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-zen-muted">
          Sort
          <select
            value={filters.sort}
            onChange={(e) =>
              onChange({
                ...filters,
                sort: e.target.value as ReadingSortOrder,
              })
            }
            className="auth-input mt-1 w-full text-sm"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </label>
      </div>

      <button type="button" onClick={onApply} className="auth-btn-secondary text-xs">
        Apply filters
      </button>
    </div>
  );
}
