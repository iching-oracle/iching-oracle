import { AdminShell } from "@/components/admin/admin-shell";
import { getLaunchChecklist } from "@/lib/admin/launch-checklist";

export default function AdminLaunchPage() {
  const items = getLaunchChecklist();
  const fails = items.filter((i) => i.status === "fail").length;
  const warns = items.filter((i) => i.status === "warn").length;

  return (
    <AdminShell title="Launch readiness">
      <p className="text-sm text-zen-muted">
        {fails === 0
          ? "No blocking failures detected in environment checks."
          : `${fails} blocking issue(s) require attention.`}
        {warns > 0 ? ` ${warns} warning(s).` : ""}
      </p>

      <ul className="mt-8 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className={`rounded-xl border p-4 ${
              item.status === "pass"
                ? "border-emerald-500/30 bg-emerald-500/5"
                : item.status === "warn"
                  ? "border-amber-gold/30 bg-amber-gold/5"
                  : "border-red-500/30 bg-red-500/5"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <p className="font-medium text-foreground">{item.label}</p>
              <span
                className={`shrink-0 text-[10px] uppercase tracking-widest ${
                  item.status === "pass"
                    ? "text-emerald-400"
                    : item.status === "warn"
                      ? "text-amber-gold"
                      : "text-red-300"
                }`}
              >
                {item.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-zen-muted">{item.detail}</p>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
