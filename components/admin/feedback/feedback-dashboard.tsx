"use client";

import { Suspense } from "react";
import { FeedbackFilters } from "@/components/admin/feedback/feedback-filters";
import { FeedbackTable } from "@/components/admin/feedback/feedback-table";
import type { AdminFeedbackPageData } from "@/types/admin-feedback";

type FeedbackDashboardProps = {
  data: AdminFeedbackPageData;
};

export function FeedbackDashboard({ data }: FeedbackDashboardProps) {
  return (
    <div className="space-y-8">
      <Suspense
        fallback={
          <div className="h-10 animate-pulse rounded-xl bg-white/5" />
        }
      >
        <FeedbackFilters category={data.category} sort={data.sort} />
      </Suspense>

      <FeedbackTable data={data} />
    </div>
  );
}
