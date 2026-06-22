import { escapeHtml, renderReadingCard } from "@/lib/email/templates/layout";
import type { WeeklyOracleContent } from "@/lib/weekly-oracle/generate";

export function renderWeeklyOracleEmailBody(
  oracle: WeeklyOracleContent,
  greeting: string,
): string {
  return `
    <p style="margin:0 0 16px;">Hello ${escapeHtml(greeting)},</p>
    <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#c5a059;">Week ${oracle.weekNumber}</p>
    <p style="margin:0 0 16px;">One hexagram for the week ahead — shared with every subscriber, a quiet anchor for reflection.</p>
    ${renderReadingCard({
      title: oracle.title,
      theme: "Weekly Oracle",
      excerpt: oracle.message,
    })}
    <p style="margin:20px 0 0;font-size:14px;line-height:1.65;color:#b8b4c4;">
      <strong style="color:#e8d5a8;">Reflection</strong><br />
      <span style="font-style:italic;">${escapeHtml(oracle.reflectionQuestion)}</span>
    </p>
  `;
}

export function renderWeeklyOracleEmailText(
  oracle: WeeklyOracleContent,
  greeting: string,
  ctaUrl: string,
): string {
  return [
    `Hello ${greeting},`,
    "",
    `Week ${oracle.weekNumber} — ${oracle.title}`,
    "",
    oracle.message,
    "",
    `Reflection: ${oracle.reflectionQuestion}`,
    "",
    `Read full interpretation: ${ctaUrl}`,
  ].join("\n");
}
