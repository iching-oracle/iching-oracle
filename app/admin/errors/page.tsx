import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminSystemEvents, getAdminSupportTickets } from "@/lib/admin/stats";
import { formatDateTime } from "@/lib/format-date";

export default async function AdminErrorsPage() {
  const [events, tickets] = await Promise.all([
    getAdminSystemEvents(),
    getAdminSupportTickets(20),
  ]);

  return (
    <AdminShell title="Errors & support">
      <section className="rounded-2xl border border-white/10 p-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
          System events
        </h2>
        <ul className="mt-4 max-h-96 space-y-3 overflow-y-auto text-sm">
          {events.map((e) => (
            <li
              key={e.id}
              className="rounded-lg border border-white/10 bg-zen-bg/40 p-3"
            >
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-red-300">{e.level}</span>
                <span className="text-amber-gold/80">{e.category}</span>
                <span className="text-zen-muted">
                  {formatDateTime(e.createdAt, "en-US")}
                </span>
              </div>
              <p className="mt-2 text-foreground">{e.message}</p>
              {e.path ? (
                <p className="mt-1 text-xs text-zen-muted">{e.path}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-white/10 p-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
          Support tickets
        </h2>
        <ul className="mt-4 divide-y divide-white/10 text-sm">
          {tickets.map((t) => (
            <li key={t.id} className="py-4">
              <p className="font-medium text-foreground">
                [{t.status}] {t.subject}
              </p>
              <p className="text-xs text-zen-muted">
                {t.category} · {t.email}
              </p>
              <p className="mt-2 line-clamp-2 text-zen-muted">{t.message}</p>
            </li>
          ))}
        </ul>
      </section>
    </AdminShell>
  );
}
