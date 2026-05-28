/** Shared PostHog configuration (client + server). */

export function getPostHogKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() ||
    process.env.POSTHOG_API_KEY?.trim() ||
    undefined
  );
}

export function getPostHogHost(): string {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ??
    "https://us.i.posthog.com"
  );
}

export function isPostHogConfigured(): boolean {
  return Boolean(getPostHogKey());
}
