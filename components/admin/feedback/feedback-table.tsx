"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FeedbackDetailDrawer } from "@/components/admin/feedback/feedback-detail-drawer";
import {
  feedbackCategoryLabel,
  feedbackSourceLabel,
} from "@/lib/admin/feedback-labels";
import { formatDateTime } from "@/lib/format-date";
import type { AdminFeedbackPageData, AdminFeedbackRow } from "@/types/admin-feedback";

type FeedbackTableProps = {
  data: AdminFeedbackPageData;
};

function truncate(text: string, max = 96): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function RatingStars({ rating }: { rating: number | null }) {
  if (rating == null) {
    return <span className="text-zen-muted">—</span>;
  }
  return (
    <span className="tabular-nums text-amber-gold/90">
      {rating}
      <span className="text-amber-gold/50">/5</span>
    </span>
  );
}

function buildPageHref(
  pathname: string,
  searchParams: URLSearchParams,
  page: number,
) {
  const next = new URLSearchParams(searchParams.toString());
  next.set("page", String(page));
  return `${pathname}?${next.toString()}`;
}

export function FeedbackTable({ data }: FeedbackTableProps) {
  const [selected, setSelected] = useState<AdminFeedbackRow | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (data.totalMatching === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-zen-surface/30 px-8 py-16 text-center">
        <p className="font-serif text-lg text-foreground/90">No feedback yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-zen-muted">
          Submissions from the beta feedback form and in-app flows will appear
          here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-zen-surface/40">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.22em] text-zen-muted">
                <th className="px-4 py-3.5 font-medium sm:px-5">User</th>
                <th className="px-4 py-3.5 font-medium sm:px-5">Category</th>
                <th className="px-4 py-3.5 font-medium sm:px-5">Rating</th>
                <th className="px-4 py-3.5 font-medium sm:px-5">Message</th>
                <th className="px-4 py-3.5 font-medium sm:px-5">Source</th>
                <th className="px-4 py-3.5 font-medium sm:px-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {data.items.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                  onClick={() => setSelected(row)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(row);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View feedback from ${row.userEmail ?? "anonymous user"}`}
                >
                  <td className="px-4 py-4 sm:px-5">
                    <p className="font-medium text-foreground/90">
                      {row.userEmail ?? "Anonymous"}
                    </p>
                    {row.userName ? (
                      <p className="mt-0.5 text-xs text-zen-muted">
                        {row.userName}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 sm:px-5">
                    <span className="inline-flex rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-foreground/85">
                      {feedbackCategoryLabel(row.type)}
                    </span>
                  </td>
                  <td className="px-4 py-4 sm:px-5">
                    <RatingStars rating={row.rating} />
                  </td>
                  <td className="max-w-[16rem] px-4 py-4 text-zen-muted sm:px-5">
                    {truncate(row.message)}
                  </td>
                  <td className="max-w-[10rem] px-4 py-4 text-xs text-zen-muted sm:px-5">
                    {feedbackSourceLabel(row)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-xs text-zen-muted sm:px-5">
                    {formatDateTime(row.createdAt, "en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data.totalPages > 1 ? (
        <nav
          className="mt-6 flex items-center justify-between gap-4 text-sm"
          aria-label="Feedback pagination"
        >
          <p className="text-xs text-zen-muted">
            Page {data.page} of {data.totalPages} · {data.totalMatching} entries
          </p>
          <div className="flex gap-2">
            {data.page > 1 ? (
              <Link
                href={buildPageHref(pathname, searchParams, data.page - 1)}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zen-muted transition-colors hover:border-amber-gold/30 hover:text-foreground"
              >
                Previous
              </Link>
            ) : null}
            {data.page < data.totalPages ? (
              <Link
                href={buildPageHref(pathname, searchParams, data.page + 1)}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zen-muted transition-colors hover:border-amber-gold/30 hover:text-foreground"
              >
                Next
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}

      <FeedbackDetailDrawer item={selected} onClose={() => setSelected(null)} />
    </>
  );
}
