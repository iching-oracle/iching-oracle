export const SITE_NAME = "I Ching Oracle";
export const SITE_TAGLINE = "Ancient wisdom interpreted through modern AI";
export const DEFAULT_OG_LOCALE = "en_US";

export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
