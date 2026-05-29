import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard/analytics-dashboard";
import { requireAdminSession } from "@/lib/admin/guard";
import { getAnalyticsDashboardData } from "@/lib/analytics-service";

export const metadata = {
  title: "Analytics | Admin",
  robots: { index: false, follow: false },
};

export const revalidate = 300;

export default async function AdminAnalyticsPage() {
  await requireAdminSession();
  const data = await getAnalyticsDashboardData();

  return <AnalyticsDashboard data={data} />;
}
