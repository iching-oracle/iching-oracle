import { describe, expect, it } from "vitest";
import { hashPasswordResetToken } from "@/lib/auth/password-reset-crypto";
import {
  getPasswordResetTokenExpiry,
  isPasswordResetTokenExpired,
} from "@/lib/tokens";

describe("password reset tokens", () => {
  it("hashes tokens deterministically", () => {
    const token = "abc123";
    expect(hashPasswordResetToken(token)).toBe(hashPasswordResetToken(token));
    expect(hashPasswordResetToken(token)).not.toBe(token);
  });

  it("expires after one hour window", () => {
    const expiry = getPasswordResetTokenExpiry();
    const oneHourFromNow = Date.now() + 60 * 60 * 1000;
    expect(expiry.getTime()).toBeGreaterThan(Date.now());
    expect(expiry.getTime()).toBeLessThanOrEqual(oneHourFromNow + 1000);
    expect(isPasswordResetTokenExpired(new Date(Date.now() - 1000))).toBe(true);
    expect(isPasswordResetTokenExpired(expiry)).toBe(false);
  });
});
