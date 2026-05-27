import Link from "next/link";

type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-zen-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-amber-gold">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground/80">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
