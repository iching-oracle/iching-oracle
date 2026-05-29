import type Stripe from "stripe";

/** Stripe API 2026+ nests subscription id under invoice.parent.subscription_details. */
export function subscriptionIdFromInvoice(
  invoice: Stripe.Invoice,
): string | null {
  const parentSub = invoice.parent?.subscription_details?.subscription;
  if (typeof parentSub === "string") {
    return parentSub;
  }
  if (parentSub && typeof parentSub === "object" && "id" in parentSub) {
    return parentSub.id;
  }

  const legacy = (invoice as { subscription?: string | { id: string } | null })
    .subscription;
  if (typeof legacy === "string") {
    return legacy;
  }
  if (legacy && typeof legacy === "object" && "id" in legacy) {
    return legacy.id;
  }

  const lineSub =
    invoice.lines?.data?.find((line) => {
      if (typeof line.subscription === "string") return true;
      return Boolean(line.parent?.subscription_item_details?.subscription);
    })?.subscription ??
    invoice.lines?.data?.find(
      (line) => line.parent?.subscription_item_details?.subscription,
    )?.parent?.subscription_item_details?.subscription;

  if (typeof lineSub === "string") {
    return lineSub;
  }
  if (lineSub && typeof lineSub === "object" && "id" in lineSub) {
    return lineSub.id;
  }

  return null;
}
