import { randomBytes } from "crypto";

export function generateInviteCode(): string {
  const segment = randomBytes(4).toString("hex").toUpperCase();
  return `ORACLE-${segment}`;
}

export type InviteValidationResult =
  | { ok: true; inviteId: string; code: string }
  | { ok: false; reason: string };

export function normalizeInviteCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}
