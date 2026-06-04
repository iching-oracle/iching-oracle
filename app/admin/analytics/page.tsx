import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard/analytics-dashboard";
import { RecentSignupsTable } from "@/components/admin/analytics-dashboard/recent-signups-table";
import { requireAdminSession } from "@/lib/admin/guard";
import { getRecentSignups } from "@/lib/admin/recent-signups";
import { getAnalyticsDashboardData } from "@/lib/analytics-service";

export const metadata = {
  title: "Analytics | Admin",
  robots: { index: false, follow: false },
};

export const revalidate = 300;

export default async function AdminAnalyticsPage() {
  await requireAdminSession();
  const [data, recentSignups] = await Promise.all([
    getAnalyticsDashboardData(),
    getRecentSignups(8),
  ]);

  return (
    <AnalyticsDashboard data={data} recentSignups={recentSignups} />
  );
}
