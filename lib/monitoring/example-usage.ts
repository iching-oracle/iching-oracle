/**
 * Example: custom error reporting (import where needed).
 *
 * @example
 * import { captureException, addBreadcrumb } from "@/lib/monitoring/sentry";
 *
 * addBreadcrumb("Checkout started", { plan: "premium" });
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   captureException(error, {
 *     category: "checkout",
 *     userId: session.user.id,
 *     path: "/api/checkout",
 *     tags: { step: "create_session" },
 *   });
 * }
 */

export { captureException, captureMessage, addBreadcrumb } from "@/lib/monitoring/sentry";
