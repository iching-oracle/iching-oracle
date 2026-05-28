import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard/analytics-dashboard";
import { requireAdminSession } from "@/lib/admin/guard";
import { getMockAnalyticsDashboard } from "@/lib/admin/mock-analytics-data";

export const metadata = {
  title: "Analytics | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminAnalyticsPage() {
  await requireAdminSession();
  const data = getMockAnalyticsDashboard();

  return <AnalyticsDashboard data={data} />;
}
