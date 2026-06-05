import { randomBytes } from "crypto";

export const INVITE_ERROR_MESSAGES = {
  REQUIRED: "A beta invite code is required to register.",
  INVALID: "Invitation code invalid.",
  EXPIRED: "This invitation has expired.",
  CAPACITY: "This beta invitation has reached capacity.",
  REVOKED: "This invitation is no longer active.",
  EMAIL_MISMATCH: "This invite is reserved for another email.",
  REDEEM_FAILED: "Invite code could not be redeemed. Please try again.",
} as const;

export type InviteValidationResult =
  | { ok: true; inviteId: string; code: string; remaining: number }
  | { ok: false; reason: string };

export function generateInviteCode(): string {
  const segment = randomBytes(4).toString("hex").toUpperCase();
  return `ORACLE-${segment}`;
}

export function normalizeInviteCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function isValidCustomInviteCode(code: string): boolean {
  return /^[A-Z0-9][A-Z0-9-]{3,31}$/.test(code);
}

export function mapInviteRedeemError(error: unknown): string {
  if (error instanceof Error) {
    switch (error.message) {
      case "INVITE_EXPIRED":
        return INVITE_ERROR_MESSAGES.EXPIRED;
      case "INVITE_USED":
        return INVITE_ERROR_MESSAGES.CAPACITY;
      case "INVITE_INACTIVE":
      case "INVITE_INVALID":
        return INVITE_ERROR_MESSAGES.REVOKED;
    }
  }
  return INVITE_ERROR_MESSAGES.REDEEM_FAILED;
}
