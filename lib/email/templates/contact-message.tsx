import "server-only";

import { escapeHtml } from "@/lib/email/templates/layout";

export type ContactMessageEmailInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: Date;
  userId?: string | null;
  source?: string;
};

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "full",
    timeStyle: "medium",
    timeZone: "Europe/Berlin",
  }).format(date);
}

function messageToHtml(text: string): string {
  return escapeHtml(text).replace(/\n/g, "<br />");
}

/** Reusable HTML + plain text for inbound contact form notifications. */
export function renderContactMessageEmail(input: ContactMessageEmailInput): {
  html: string;
  text: string;
  subject: string;
} {
  const timestamp = formatTimestamp(input.submittedAt);
  const mailSubject = `[I Ching Oracle] ${input.subject}`;

  const metaRows = [
    ["Name", input.name],
    ["E-Mail", input.email],
    ["Betreff", input.subject],
    ["Zeitpunkt", timestamp],
    ...(input.userId ? [["Nutzer-ID", input.userId] as const] : []),
    ...(input.source ? [["Quelle", input.source] as const] : []),
  ] as const;

  const metaHtml = metaRows
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:6px 12px 6px 0;font-size:12px;color:#8b8798;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
          <td style="padding:6px 0;font-size:14px;color:#e8e6e3;vertical-align:top;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(mailSubject)}</title>
</head>
<body style="margin:0;padding:24px;background:#0b0c10;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:linear-gradient(145deg,#12141c,#1a1528);border:1px solid rgba(197,160,89,0.22);border-radius:16px;">
    <tr>
      <td style="padding:28px 28px 12px;">
        <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#8b7ec8;">ICHING ORACLE</p>
        <h1 style="margin:0;font-size:22px;font-weight:600;color:#e8d5a8;">Neue Kontaktanfrage</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 28px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${metaHtml}</table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 28px 28px;">
        <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#c5a059;">Nachricht</p>
        <div style="padding:16px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);font-size:15px;line-height:1.65;color:#d4d0dc;">
          ${messageToHtml(input.message)}
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    "Neue Kontaktanfrage — I Ching Oracle",
    "",
    ...metaRows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Nachricht:",
    input.message,
    "",
    "---",
    "Antworten Sie direkt an die Absender-E-Mail (Reply-To).",
  ].join("\n");

  return { html, text, subject: mailSubject };
}
