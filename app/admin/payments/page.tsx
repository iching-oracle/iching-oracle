import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/admin/stat-card";
import { prisma } from "@/lib/prisma";

export default async function AdminPaymentsPage() {
  const [active, canceled, pastDue, withStripe] = await Promise.all([
    prisma.user.count({ where: { subscriptionStatus: "active" } }),
    prisma.user.count({ where: { subscriptionStatus: "canceled" } }),
    prisma.user.count({ where: { subscriptionStatus: "past_due" } }),
    prisma.user.count({ where: { stripeCustomerId: { not: null } } }),
  ]);

  const refundTickets = await prisma.supportTicket.count({
    where: { category: "refund", status: "open" },
  });

  return (
    <AdminShell title="Payments">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active subscriptions" value={active} />
        <StatCard label="Canceled" value={canceled} />
        <StatCard label="Past due" value={pastDue} />
        <StatCard label="Stripe customers" value={withStripe} />
        <StatCard label="Open refund requests" value={refundTickets} />
      </div>
      <p className="mt-8 text-sm text-zen-muted">
        Revenue totals require Stripe Dashboard reconciliation. Webhook events are
        logged under System Events when failures occur.
      </p>
    </AdminShell>
  );
}
