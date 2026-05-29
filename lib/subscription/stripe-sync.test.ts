import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import {
  periodEndFromSubscription,
  periodStartFromSubscription,
  mapStripeSubscriptionStatus,
  subscriptionHasPremiumAccess,
} from "@/lib/subscription/stripe-period";

function makeSubscription(
  overrides: Partial<Stripe.Subscription> = {},
): Stripe.Subscription {
  return {
    id: "sub_test",
    object: "subscription",
    status: "active",
    customer: "cus_test",
    metadata: {},
    items: {
      object: "list",
      data: [
        {
          id: "si_test",
          object: "subscription_item",
          current_period_start: 1_746_000_000,
          current_period_end: 1_748_678_400,
        } as Stripe.SubscriptionItem,
      ],
      has_more: false,
      url: "/v1/subscription_items",
    },
    ...overrides,
  } as Stripe.Subscription;
}

describe("periodEndFromSubscription", () => {
  it("reads billing period from subscription items", () => {
    const end = periodEndFromSubscription(makeSubscription());
    expect(end?.toISOString()).toBe(new Date(1_748_678_400 * 1000).toISOString());
  });

  it("falls back to legacy root field when items are missing", () => {
    const end = periodEndFromSubscription(
      makeSubscription({
        items: { object: "list", data: [], has_more: false, url: "" },
        ...( { current_period_end: 1_748_678_400 } as object ),
      }),
    );
    expect(end?.toISOString()).toBe(new Date(1_748_678_400 * 1000).toISOString());
  });
});

describe("periodStartFromSubscription", () => {
  it("reads billing period start from subscription items", () => {
    const start = periodStartFromSubscription(makeSubscription());
    expect(start?.toISOString()).toBe(new Date(1_746_000_000 * 1000).toISOString());
  });
});

describe("mapStripeSubscriptionStatus", () => {
  it("maps active subscriptions to premium", () => {
    expect(mapStripeSubscriptionStatus("active")).toBe("premium");
    expect(mapStripeSubscriptionStatus("trialing")).toBe("premium");
  });

  it("maps canceled subscriptions to canceled", () => {
    expect(mapStripeSubscriptionStatus("canceled")).toBe("canceled");
  });
});

describe("subscriptionHasPremiumAccess", () => {
  it("returns true for active subscription within billing period", () => {
    const now = new Date(1_747_000_000 * 1000);
    expect(subscriptionHasPremiumAccess(makeSubscription(), now)).toBe(true);
  });

  it("returns false when billing period has ended", () => {
    const now = new Date(1_749_000_000 * 1000);
    expect(subscriptionHasPremiumAccess(makeSubscription(), now)).toBe(false);
  });

  it("returns true for active subscription without period metadata", () => {
    const sub = makeSubscription({
      items: { object: "list", data: [], has_more: false, url: "" },
    });
    expect(subscriptionHasPremiumAccess(sub)).toBe(true);
  });
});
