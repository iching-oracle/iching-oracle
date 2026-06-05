import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { FeedbackDashboard } from "@/components/admin/feedback/feedback-dashboard";
import { FeedbackSummary } from "@/components/admin/feedback/feedback-summary";
import { getAdminFeedbackPage } from "@/lib/admin/feedback";

export const metadata = {
  title: "Feedback | Admin",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function AdminFeedbackPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const data = await getAdminFeedbackPage(params);

  return (
    <AdminShell title="User feedback">
      <div className="space-y-8">
        <FeedbackSummary summary={data.summary} />
        <Suspense fallback={<div className="h-10 animate-pulse rounded-xl bg-white/5" />}>
          <FeedbackDashboard data={data} />
        </Suspense>
      </div>
    </AdminShell>
  );
}
