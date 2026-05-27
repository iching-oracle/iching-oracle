"use client";

import { useEffect, useState } from "react";

type TocItem = { id: string; label: string };

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) setActive(item.id);
        },
        { rootMargin: "-20% 0px -70% 0px" },
      );
      obs.observe(el);
      observers.push(obs);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, [items]);

  if (items.length < 3) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="rounded-xl border border-white/10 bg-zen-surface/30 p-4 text-sm"
    >
      <p className="text-[10px] font-medium uppercase tracking-widest text-zen-muted">
        On this page
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={
                active === item.id
                  ? "text-amber-gold"
                  : "text-zen-muted hover:text-foreground"
              }
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
