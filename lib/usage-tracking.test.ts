import { describe, expect, it } from "vitest";
import { estimateCostUsd } from "@/lib/usage-tracking";
import {
  getAiDailyLimit,
  getAiHourlyLimit,
  getReadingCooldownSec,
  tierBypassesLimits,
} from "@/lib/rate-limit/plan-limits";

describe("estimateCostUsd", () => {
  it("returns zero for non-positive token counts", () => {
    expect(estimateCostUsd(0)).toBe(0);
    expect(estimateCostUsd(-10)).toBe(0);
  });

  it("estimates cost from default rate", () => {
    const cost = estimateCostUsd(10_000);
    expect(cost).toBeGreaterThan(0);
    expect(cost).toBeCloseTo(0.02, 3);
  });
});

describe("plan limits", () => {
  it("bypasses limits for admin", () => {
    expect(tierBypassesLimits("admin")).toBe(true);
    expect(tierBypassesLimits("free")).toBe(false);
  });

  it("returns higher limits for premium than free", () => {
    expect(getAiHourlyLimit("premium")).toBeGreaterThan(
      getAiHourlyLimit("free"),
    );
    expect(getAiDailyLimit("premium")).toBeGreaterThan(getAiDailyLimit("free"));
    expect(getReadingCooldownSec("premium")).toBeLessThan(
      getReadingCooldownSec("free"),
    );
  });

  it("returns strictest limits for guests", () => {
    expect(getAiHourlyLimit("guest")).toBeLessThan(getAiHourlyLimit("free"));
    expect(getReadingCooldownSec("guest")).toBeGreaterThan(
      getReadingCooldownSec("premium"),
    );
  });
});
