"use client";

import { useEffect, useState } from "react";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { useAnalytics } from "@/hooks/use-analytics";
import type { BetaAnnouncementDTO } from "@/types/beta";

export function FounderAnnouncements() {
  const { track } = useAnalytics();
  const [items, setItems] = useState<BetaAnnouncementDTO[]>([]);

  useEffect(() => {
    void fetch("/api/beta/announcements")
      .then((r) => r.json())
      .then((data: { announcements: BetaAnnouncementDTO[] }) => {
        setItems(data.announcements ?? []);
        if (data.announcements?.[0]) {
          track(ANALYTICS_EVENTS.BETA_ANNOUNCEMENT_VIEWED, {
            properties: { count: data.announcements.length },
          });
        }
      })
      .catch(() => null);
  }, [track]);

  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-zen-surface/60 p-6 sm:p-8">
      <h2 className="font-serif text-xl text-foreground">Founder updates</h2>
      <p className="mt-1 text-sm text-zen-muted">
        Personal notes from the journey — transparent and calm.
      </p>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-white/10 bg-zen-bg/30 px-5 py-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground">{item.title}</p>
              {item.isPinned ? (
                <span className="text-[10px] uppercase tracking-wider text-amber-gold">
                  Pinned
                </span>
              ) : null}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zen-muted">
              {item.body}
            </p>
            <p className="mt-2 text-[10px] text-zen-muted/70">
              {new Date(item.publishedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
