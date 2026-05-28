/**
 * Product analytics — import from specific modules in app code.
 * @example import { ANALYTICS_EVENTS } from "@/lib/analytics/events"
 */

export { ANALYTICS_EVENTS, ANALYTICS_FUNNELS, FUNNEL_STEPS } from "./events";
export type { AnalyticsEventName, AnalyticsFunnelId } from "./events";
export type { AnalyticsProperties, TrackEventPayload } from "./properties";
export {
  sanitizeAnalyticsProperties,
  questionLength,
  readingAnalyticsMeta,
} from "./privacy";
