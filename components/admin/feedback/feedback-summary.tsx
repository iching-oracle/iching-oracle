import { StatCard } from "@/components/admin/stat-card";
import { RatingDistribution } from "@/components/admin/feedback/rating-distribution";
import { feedbackCategoryLabel } from "@/lib/admin/feedback-labels";
import { formatDateTime } from "@/lib/format-date";
import type { AdminFeedbackSummary } from "@/types/admin-feedback";

type FeedbackSummaryProps = {
  summary: AdminFeedbackSummary;
};

export function FeedbackSummary({ summary }: FeedbackSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total feedback" value={summary.totalCount} />
        <StatCard
          label="Average rating"
          value={
            summary.averageRating != null ? `${summary.averageRating} / 5` : "—"
          }
          hint={
            summary.averageRating != null
              ? "Rated submissions only"
              : "No ratings yet"
          }
        />
        <StatCard
          label="Top category"
          value={
            summary.topCategory
              ? feedbackCategoryLabel(summary.topCategory)
              : "—"
          }
        />
        <StatCard
          label="Latest submission"
          value={
            summary.latestSubmissionAt
              ? formatDateTime(summary.latestSubmissionAt, "en-US")
              : "—"
          }
        />
      </div>

      {summary.totalCount > 0 ? (
        <RatingDistribution buckets={summary.ratingDistribution} />
      ) : null}
    </div>
  );
}
