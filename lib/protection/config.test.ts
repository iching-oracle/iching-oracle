import { afterEach, describe, expect, it } from "vitest";
import {
  isAiDisabled,
  isMaintenanceMode,
  isRateLimitEnforced,
} from "@/lib/protection/config";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("protection config", () => {
  it("detects maintenance mode", () => {
    process.env.MAINTENANCE_MODE = "true";
    expect(isMaintenanceMode()).toBe(true);
  });

  it("detects AI kill switch", () => {
    process.env.AI_DISABLED = "true";
    expect(isAiDisabled()).toBe(true);
  });

  it("enforces rate limits when explicitly enabled", () => {
    process.env.NODE_ENV = "development";
    process.env.ENFORCE_RATE_LIMIT = "true";
    expect(isRateLimitEnforced()).toBe(true);
  });
});
