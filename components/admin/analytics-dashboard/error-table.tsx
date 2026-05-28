"use client";

import type { ErrorLogRow } from "@/lib/admin/mock-analytics-data";

export function ErrorTable({
  title,
  rows,
}: {
  title: string;
  rows: ErrorLogRow[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zen-surface/50 backdrop-blur-xl overflow-hidden">
      <div className="border-b border-white/10 px-4 py-3 sm:px-5">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-zen-muted">
              <th className="px-4 py-2 font-medium sm:px-5">Time</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Message</th>
              <th className="px-4 py-2 font-medium sm:px-5">Meta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => (
              <tr key={row.id} className="text-zen-muted hover:bg-white/[0.02]">
                <td className="whitespace-nowrap px-4 py-3 sm:px-5">{row.time}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-amber-gold/90">
                    {row.type}
                  </span>
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-foreground/90">
                  {row.message}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs sm:px-5">
                  {row.status ? `${row.status}` : ""}
                  {row.durationMs ? ` · ${row.durationMs}ms` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
