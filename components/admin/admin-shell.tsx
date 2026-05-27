import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/readings", label: "Readings" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/errors", label: "Errors" },
  { href: "/admin/launch", label: "Launch" },
];

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-48 shrink-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold">
            Admin
          </p>
          <nav className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:gap-1" aria-label="Admin">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-zen-muted hover:bg-white/5 hover:text-amber-gold"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl text-foreground">{title}</h1>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
