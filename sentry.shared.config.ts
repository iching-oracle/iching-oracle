import type { BrowserOptions, NodeOptions } from "@sentry/nextjs";

const dsn =
  process.env.SENTRY_DSN?.trim() ||
  process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() ||
  "";

export function getSentryDsn(): string | undefined {
  return dsn || undefined;
}

export function isSentryEnabled(): boolean {
  return Boolean(getSentryDsn());
}

function tracesSampleRate(): number {
  const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV;
  if (env === "production") return 0.1;
  if (env === "preview") return 0.2;
  return 0;
}

function replaysSessionSampleRate(): number {
  const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV;
  if (env === "production") return 0.05;
  if (env === "preview") return 0.1;
  return 0;
}

export function getSentryEnvironment(): string {
  const vercel = process.env.VERCEL_ENV?.trim();
  if (vercel) return vercel;
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

export const sharedSentryOptions: BrowserOptions & NodeOptions = {
  dsn: getSentryDsn(),
  enabled: isSentryEnabled(),
  environment: getSentryEnvironment(),
  release: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.npm_package_version,
  tracesSampleRate: tracesSampleRate(),
  sendDefaultPii: false,
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers.cookie;
      delete event.request.headers.authorization;
    }
    return event;
  },
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    /Non-Error promise rejection captured/,
  ],
};

export const clientReplayOptions: Pick<
  BrowserOptions,
  "replaysSessionSampleRate" | "replaysOnErrorSampleRate" | "integrations"
> = {
  replaysSessionSampleRate: replaysSessionSampleRate(),
  replaysOnErrorSampleRate: 1.0,
};
