import "server-only";

import { getSiteUrl } from "@/lib/seo/site";

export type LaunchCheckItem = {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
};

export function getLaunchChecklist(): LaunchCheckItem[] {
  const items: LaunchCheckItem[] = [];

  const db = Boolean(
    process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim(),
  );
  items.push({
    id: "database",
    label: "Database connection configured",
    status: db ? "pass" : "fail",
    detail: db ? "DATABASE_URL is set" : "Missing DATABASE_URL",
  });

  const authSecret = Boolean(process.env.AUTH_SECRET?.trim());
  items.push({
    id: "auth",
    label: "Auth secret configured",
    status: authSecret ? "pass" : "fail",
    detail: authSecret ? "AUTH_SECRET present" : "Set AUTH_SECRET",
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  items.push({
    id: "app_url",
    label: "Canonical app URL",
    status: appUrl && !appUrl.includes("localhost") ? "pass" : "warn",
    detail: appUrl ?? `Fallback: ${getSiteUrl()}`,
  });

  const stripe = Boolean(process.env.STRIPE_SECRET_KEY?.trim());
  const stripeLive = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live");
  items.push({
    id: "stripe",
    label: "Stripe configured",
    status: stripe ? "pass" : "warn",
    detail: stripe
      ? stripeLive
        ? "Live mode key detected"
        : "Test mode key (expected pre-launch)"
      : "STRIPE_SECRET_KEY not set",
  });

  const webhook = Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());
  items.push({
    id: "stripe_webhook",
    label: "Stripe webhook secret",
    status: webhook ? "pass" : "warn",
    detail: webhook ? "Configured" : "STRIPE_WEBHOOK_SECRET missing",
  });

  const ai = Boolean(process.env.DEEPSEEK_API_KEY?.trim());
  items.push({
    id: "ai",
    label: "AI provider key",
    status: ai ? "pass" : "fail",
    detail: ai ? "DEEPSEEK_API_KEY set" : "Interpretations will fail",
  });

  const adminEmails = Boolean(process.env.ADMIN_EMAILS?.trim());
  items.push({
    id: "admin",
    label: "Admin access configured",
    status: adminEmails ? "pass" : "warn",
    detail: adminEmails
      ? "ADMIN_EMAILS set"
      : "Set ADMIN_EMAILS or assign ADMIN role in DB",
  });

  const gsc = Boolean(process.env.NEXT_PUBLIC_GSC_VERIFICATION?.trim());
  items.push({
    id: "seo",
    label: "Search Console verification",
    status: gsc ? "pass" : "warn",
    detail: gsc ? "GSC tag configured" : "Optional: NEXT_PUBLIC_GSC_VERIFICATION",
  });

  const sentry = Boolean(process.env.SENTRY_DSN?.trim());
  items.push({
    id: "sentry",
    label: "Error monitoring (Sentry)",
    status: sentry ? "pass" : "warn",
    detail: sentry ? "SENTRY_DSN set" : "Optional but recommended",
  });

  const resend = Boolean(process.env.RESEND_API_KEY?.trim());
  items.push({
    id: "email",
    label: "Transactional email",
    status: resend ? "pass" : "warn",
    detail: resend ? "RESEND_API_KEY set" : "Verification emails need Resend",
  });

  return items;
}
