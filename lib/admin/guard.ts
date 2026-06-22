import "server-only";

/**
 * Admin access control — use in layouts, pages, and API routes.
 *
 * Configure allowlisted emails via ADMIN_EMAILS (comma-separated).
 * Users with role === "ADMIN" in the database always have access.
 */

export {
  getAdminEmails,
  getAdminApiSession,
  isAdminUser,
  requireAdminSession,
} from "@/lib/admin/auth";

export { isEmailInAdminAllowlist } from "@/lib/admin/edge-admin";
