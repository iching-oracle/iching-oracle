/**
 * Custom event helpers — thin wrappers over client/server capture.
 */

export { ANALYTICS_EVENTS } from "@/lib/analytics/events";
export type { AnalyticsEventName } from "@/lib/analytics/events";
export { captureClientEvent } from "@/lib/analytics/client";
export { trackServerEvent } from "@/lib/analytics/server";
export type { ServerTrackOptions } from "@/lib/analytics/server";
