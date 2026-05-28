/**
 * Edge-safe admin checks (middleware / auth.config).
 * Uses ADMIN_EMAILS env only — DB role is validated in requireAdminSession().
 */

export function getAdminEmailsFromEnv(): string[] {
  const raw = process.env.ADMIN_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailInAdminAllowlist(
  email: string | null | undefined,
): boolean {
  if (!email) return false;
  return getAdminEmailsFromEnv().includes(email.toLowerCase());
}

export function isAdminSessionUser(user: {
  email?: string | null;
  role?: string | null;
}): boolean {
  if (user.role === "ADMIN") return true;
  return isEmailInAdminAllowlist(user.email);
}
