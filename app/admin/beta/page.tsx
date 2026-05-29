import { AdminShell } from "@/components/admin/admin-shell";
import { AdminBetaPanel } from "@/components/admin/admin-beta-panel";

export default function AdminBetaPage() {
  return (
    <AdminShell title="Beta program">
      <AdminBetaPanel />
    </AdminShell>
  );
}
