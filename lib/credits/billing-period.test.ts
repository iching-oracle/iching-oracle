import { describe, expect, it } from "vitest";
import {
  computeCreditsResetAt,
  isDuplicateInvoiceRefill,
  shouldRefillFreeDaily,
  shouldRefillPremiumPeriod,
  startOfUtcDay,
} from "@/lib/credits/billing-period";

describe("shouldRefillFreeDaily", () => {
  it("returns false for premium users", () => {
    expect(
      shouldRefillFreeDaily(
        {
          planType: "PREMIUM",
          isPremium: true,
          lastCreditRefillAt: null,
          lastCreditRefillPeriodEnd: null,
          subscriptionCurrentPeriodEnd: new Date("2026-06-01"),
        },
        new Date("2026-05-26T12:00:00Z"),
      ),
    ).toBe(false);
  });

  it("returns true when free user never refilled", () => {
    expect(
      shouldRefillFreeDaily(
        {
          planType: "FREE",
          isPremium: false,
          lastCreditRefillAt: null,
          lastCreditRefillPeriodEnd: null,
          subscriptionCurrentPeriodEnd: null,
        },
        new Date("2026-05-26T12:00:00Z"),
      ),
    ).toBe(true);
  });

  it("returns false when already refilled today UTC", () => {
    const now = new Date("2026-05-26T15:00:00Z");
    expect(
      shouldRefillFreeDaily(
        {
          planType: "FREE",
          isPremium: false,
          lastCreditRefillAt: new Date("2026-05-26T01:00:00Z"),
          lastCreditRefillPeriodEnd: null,
          subscriptionCurrentPeriodEnd: null,
        },
        now,
      ),
    ).toBe(false);
  });

  it("returns true when last refill was yesterday", () => {
    expect(
      shouldRefillFreeDaily(
        {
          planType: "FREE",
          isPremium: false,
          lastCreditRefillAt: new Date("2026-05-25T23:59:00Z"),
          lastCreditRefillPeriodEnd: null,
          subscriptionCurrentPeriodEnd: null,
        },
        new Date("2026-05-26T08:00:00Z"),
      ),
    ).toBe(true);
  });
});

describe("shouldRefillPremiumPeriod", () => {
  const periodStart = new Date("2026-05-01T00:00:00Z");
  const periodEnd = new Date("2026-06-01T00:00:00Z");

  it("returns false when period already refilled", () => {
    expect(
      shouldRefillPremiumPeriod(
        {
          planType: "PREMIUM",
          isPremium: true,
          lastCreditRefillAt: new Date("2026-05-01T01:00:00Z"),
          lastCreditRefillPeriodEnd: periodEnd,
          subscriptionCurrentPeriodEnd: periodEnd,
        },
        periodEnd,
        periodStart,
      ),
    ).toBe(false);
  });

  it("returns true for new billing period", () => {
    const nextPeriodEnd = new Date("2026-07-01T00:00:00Z");
    const nextPeriodStart = new Date("2026-06-01T00:00:00Z");
    expect(
      shouldRefillPremiumPeriod(
        {
          planType: "PREMIUM",
          isPremium: true,
          lastCreditRefillAt: new Date("2026-05-01T01:00:00Z"),
          lastCreditRefillPeriodEnd: periodEnd,
          subscriptionCurrentPeriodEnd: periodEnd,
        },
        nextPeriodEnd,
        nextPeriodStart,
      ),
    ).toBe(true);
  });
});

describe("isDuplicateInvoiceRefill", () => {
  it("detects duplicate period end", () => {
    const periodEnd = new Date("2026-06-01T00:00:00Z");
    expect(isDuplicateInvoiceRefill(periodEnd, periodEnd)).toBe(true);
    expect(
      isDuplicateInvoiceRefill(
        new Date("2026-07-01T00:00:00Z"),
        new Date("2026-06-01T00:00:00Z"),
      ),
    ).toBe(true);
    expect(
      isDuplicateInvoiceRefill(
        new Date("2026-05-01T00:00:00Z"),
        new Date("2026-06-01T00:00:00Z"),
      ),
    ).toBe(false);
  });
});

describe("computeCreditsResetAt", () => {
  it("uses subscription period end for premium", () => {
    const periodEnd = new Date("2026-06-15T00:00:00Z");
    const reset = computeCreditsResetAt(
      {
        planType: "PREMIUM",
        isPremium: true,
        lastCreditRefillAt: new Date("2026-05-15T00:00:00Z"),
        lastCreditRefillPeriodEnd: periodEnd,
        subscriptionCurrentPeriodEnd: periodEnd,
      },
      "PREMIUM",
      new Date("2026-05-26T00:00:00Z"),
    );
    expect(reset?.toISOString()).toBe(periodEnd.toISOString());
  });

  it("returns next UTC day for free users", () => {
    const now = new Date("2026-05-26T12:00:00Z");
    const reset = computeCreditsResetAt(
      {
        planType: "FREE",
        isPremium: false,
        lastCreditRefillAt: now,
        lastCreditRefillPeriodEnd: null,
        subscriptionCurrentPeriodEnd: null,
      },
      "FREE",
      now,
    );
    expect(reset?.toISOString()).toBe(
      new Date(Date.UTC(2026, 4, 27)).toISOString(),
    );
  });
});

describe("startOfUtcDay", () => {
  it("normalizes to UTC midnight", () => {
    const day = startOfUtcDay(new Date("2026-05-26T18:30:00Z"));
    expect(day.toISOString()).toBe("2026-05-26T00:00:00.000Z");
  });
});

describe("refresh/login spam protection", () => {
  it("simulates repeated balance checks without triggering refill eligibility", () => {
    const now = new Date("2026-05-26T10:00:00Z");
    const input = {
      planType: "PREMIUM",
      isPremium: true,
      lastCreditRefillAt: new Date("2026-05-01T00:00:00Z"),
      lastCreditRefillPeriodEnd: new Date("2026-06-01T00:00:00Z"),
      subscriptionCurrentPeriodEnd: new Date("2026-06-01T00:00:00Z"),
    };

    for (let i = 0; i < 50; i++) {
      expect(shouldRefillPremiumPeriod(
        input,
        new Date("2026-06-01T00:00:00Z"),
        new Date("2026-05-01T00:00:00Z"),
      )).toBe(false);
      expect(shouldRefillFreeDaily(input, now)).toBe(false);
    }
  });
});
