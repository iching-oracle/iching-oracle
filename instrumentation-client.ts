import * as Sentry from "@sentry/nextjs";
import { clientReplayOptions, sharedSentryOptions } from "./sentry.shared.config";

Sentry.init({
  ...sharedSentryOptions,
  ...clientReplayOptions,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
