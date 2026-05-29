import "server-only";

export function isBetaInviteOnly(): boolean {
  return process.env.BETA_INVITE_ONLY?.trim().toLowerCase() === "true";
}

export function getBetaCreditsBonus(): number {
  const raw = process.env.BETA_CREDITS_BONUS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 50;
  return Number.isFinite(n) && n > 0 ? n : 50;
}

export function isBetaFeatureEnabled(flag: string): boolean {
  const envKey = `BETA_FEATURE_${flag.toUpperCase().replace(/-/g, "_")}`;
  const val = process.env[envKey]?.trim().toLowerCase();
  if (val === "true" || val === "1") return true;
  if (val === "false" || val === "0") return false;
  return true;
}
