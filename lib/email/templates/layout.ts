import { getAppUrl } from "@/lib/email/client";

export type EmailLayoutOptions = {
  preheader?: string;
  title: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  footerNote?: string;
  unsubscribeUrl?: string;
};

/** Premium dark email shell — table-based for client compatibility. */
export function renderEmailLayout(options: EmailLayoutOptions): string {
  const appUrl = getAppUrl();
  const preheader = options.preheader ?? options.title;
  const ctaBlock = options.cta
    ? `
      <tr>
        <td style="padding:8px 32px 28px;text-align:center;">
          <a href="${options.cta.href}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#c5a059 0%,#a8843f 100%);color:#0a0a0f;font-size:14px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;border-radius:999px;box-shadow:0 0 24px rgba(197,160,89,0.35);">
            ${escapeHtml(options.cta.label)}
          </a>
        </td>
      </tr>`
    : "";

  const footer = options.footerNote
    ? `<p style="margin:0 0 12px;font-size:12px;line-height:1.55;color:#6b6780;">${escapeHtml(options.footerNote)}</p>`
    : "";

  const unsub = options.unsubscribeUrl
    ? `<p style="margin:12px 0 0;font-size:11px;color:#5a5668;"><a href="${options.unsubscribeUrl}" style="color:#8b7ec8;text-decoration:underline;">Manage email preferences</a></p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${escapeHtml(options.title)}</title>
  <!--[if mso]><style type="text/css">body,table,td{font-family:Georgia,serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0b0c10;font-family:Georgia,'Times New Roman',serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0c10;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:linear-gradient(145deg,#12141c 0%,#1a1528 100%);border:1px solid rgba(197,160,89,0.22);border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 8px;text-align:center;">
              <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#8b7ec8;">ICHING ORACLE</p>
              <h1 style="margin:0;font-size:24px;font-weight:600;color:#e8d5a8;line-height:1.3;">${escapeHtml(options.title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 8px;font-size:15px;line-height:1.7;color:#b8b4c4;">
              ${options.bodyHtml}
            </td>
          </tr>
          ${ctaBlock}
          <tr>
            <td style="padding:20px 32px 28px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
              ${footer}
              <p style="margin:0;font-size:11px;color:#5a5668;">
                <a href="${appUrl}" style="color:#c5a059;text-decoration:none;">${appUrl.replace(/^https?:\/\//, "")}</a>
              </p>
              ${unsub}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderReadingCard(input: {
  title: string;
  excerpt: string;
  theme?: string;
}): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;background:rgba(255,255,255,0.04);border:1px solid rgba(197,160,89,0.15);border-radius:12px;">
      <tr>
        <td style="padding:20px;">
          ${input.theme ? `<p style="margin:0 0 8px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#c5a059;">${escapeHtml(input.theme)}</p>` : ""}
          <p style="margin:0 0 8px;font-size:16px;color:#e8e6e3;font-weight:600;">${escapeHtml(input.title)}</p>
          <p style="margin:0;font-size:14px;line-height:1.65;color:#9a96a8;font-style:italic;">${escapeHtml(input.excerpt)}</p>
        </td>
      </tr>
    </table>`;
}
