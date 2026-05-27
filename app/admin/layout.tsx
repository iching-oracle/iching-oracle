import { requireAdminSession } from "@/lib/admin/auth";

export const metadata = {
  title: "Admin | I Ching Oracle",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();
  return children;
}
