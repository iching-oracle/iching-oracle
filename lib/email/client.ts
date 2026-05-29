import "server-only";

import { Resend } from "resend";

export const DEFAULT_FROM = "I Ching Oracle <noreply@ichingoracle.de>";

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export function getEmailFrom(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    process.env.EMAIL_FROM_ADDRESS?.trim() ||
    DEFAULT_FROM
  );
}

export function isEmailConfigured(): boolean {
  return Boolean(getResendClient());
}

export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}
