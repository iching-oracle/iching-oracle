import "server-only";

import { getSiteUrl } from "@/lib/seo/site";

/** Canonical site origin for metadataBase, sitemap, and JSON-LD. */
export function getMetadataBase(): URL {
  return new URL(`${getSiteUrl()}/`);
}

/** Paths that must not be indexed (app, auth, admin, duplicates). */
export const ROBOTS_DISALLOW = [
  "/api/",
  "/admin/",
  "/dashboard",
  "/dashboard/",
  "/history",
  "/history/",
  "/billing",
  "/settings/",
  "/oracle/",
  "/insights/",
  "/payment/",
  "/login",
  "/register",
  "/beta/",
  "/account-deleted",
  "/verify-email/",
  "/forgot-password",
  "/reset-password",
  "/unsubscribe/",
  "/sentry-example-page",
  "/readings/",
  "/reading/guided",
  "/reading/new",
] as const;

/** High-value public routes included in sitemap.xml */
export const SITEMAP_STATIC_PATHS = [
  "/",
  "/pricing",
  "/hexagrams",
  "/guides",
  "/learn",
  "/contact",
  "/support",
  "/trust/ai",
  "/privacy",
  "/terms",
  "/impressum",
  "/cookies",
  "/disclaimer",
  "/refund-policy",
  "/daily",
] as const;
