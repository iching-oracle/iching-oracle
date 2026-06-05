import type { AdminFeedbackRow } from "@/types/admin-feedback";

export function feedbackCategoryLabel(type: string): string {
  const labels: Record<string, string> = {
    bug: "Bug report",
    feature: "Feature request",
    general: "General feedback",
    ux: "Emotional / UX",
  };
  return labels[type] ?? type;
}

export function feedbackSourceLabel(row: AdminFeedbackRow): string {
  const parts: string[] = [];
  if (row.flow) parts.push(row.flow);
  if (row.pagePath) parts.push(row.pagePath);
  return parts.length > 0 ? parts.join(" · ") : "—";
}
