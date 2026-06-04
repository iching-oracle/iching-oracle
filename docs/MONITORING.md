# Monitoring & Analytics — I Ching Oracle

Production observability stack: **Sentry** (errors + performance + replay), **PostHog** (product analytics), first-party DB events, and **/admin/analytics**.

## Install

```bash
npm install @sentry/nextjs posthog-js posthog-node
```

Already wired in this repo; run `npm install` after pull.

## Environment variables

Add to `.env` / Vercel:

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@o0.ingest.sentry.io/0
SENTRY_DSN=                        # optional server alias (defaults to public DSN)
SENTRY_ORG=your-org
SENTRY_PROJECT=iching-oracle
SENTRY_AUTH_TOKEN=                  # CI + Vercel source map upload

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
POSTHOG_PERSONAL_API_KEY=phx_...    # admin dashboard HogQL (optional)
POSTHOG_PROJECT_ID=12345

# Admin
ADMIN_EMAILS=you@example.com
```

## File structure

```
instrumentation.ts              # Sentry server/edge registration
instrumentation-client.ts       # Sentry browser + replay
sentry.server.config.ts
sentry.edge.config.ts
sentry.shared.config.ts

lib/monitoring/
  sentry.ts                     # captureException, setSentryUser
  logger.ts                     # SystemEvent + Sentry
  report-error.ts               # client error reporter
  request-timeout.ts            # fetchWithTimeout
  ai-client.ts                  # DeepSeek fetch + retry
  sanitize.ts                   # strip PII from context
  env.ts

lib/analytics/
  events.ts                     # event catalog
  client.ts                     # PostHog client + mirror API
  server.ts                     # server capture + DB
  feature-flags.ts              # PostHog flags
  track.ts                      # re-exports

components/monitoring/sentry-user-sync.tsx
components/analytics/analytics-provider.tsx
app/admin/analytics/page.tsx
docs/MONITORING.md
```

## Sentry on Vercel

1. Create a Sentry project (Next.js).
2. Connect the **Vercel integration** — injects `SENTRY_AUTH_TOKEN`, org, project.
3. Set `NEXT_PUBLIC_SENTRY_DSN` in Vercel env (Production + Preview).
4. Source maps upload automatically when `SENTRY_AUTH_TOKEN` is set at build time.
5. Environments map to `VERCEL_ENV`: `production`, `preview`, `development`.

Tunnel route: `/monitoring` (configured in `next.config.ts`) reduces ad-blocker drops.

### What is captured

- React errors via `app/error.tsx`, `app/global-error.tsx`
- API failures via `handleRouteError` → `logSystemEvent` → Sentry
- Stripe webhook handler errors
- DeepSeek / AI failures (`lib/monitoring/ai-client.ts`, `lib/ai.ts`)
- Auth/session issues (tagged by route category)
- User context: **user id only** after login (`SentryUserSync`)

Sensitive fields (email, question text, tokens) are stripped in `sanitize.ts` and Sentry `beforeSend`.

## PostHog

1. Create EU or US project at [posthog.com](https://posthog.com).
2. Copy project API key → `NEXT_PUBLIC_POSTHOG_KEY`.
3. Set host (`https://eu.i.posthog.com` recommended for GDPR).

### Tracked events (consent-gated)

| Event | Trigger |
|-------|---------|
| `user_signed_up` | Registration API |
| `user_logged_in` | NextAuth signIn |
| `subscription_started` | Stripe checkout |
| `subscription_cancelled` | Stripe subscription deleted |
| `reading_generated` | Guided reading API |
| `reading_shared` | Share modal |
| `upgrade_clicked` | Upgrade CTA |
| `page_viewed` | `PageViewTracker` |

Reading **content is never sent** — only `question_length`, category, hexagram id, etc.

### Feature flags

Define flags in PostHog, use in app:

```tsx
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { FEATURE_FLAGS } from "@/lib/analytics/feature-flags";

const { enabled } = useFeatureFlag(FEATURE_FLAGS.INSIGHTS_BETA);
```

### Cookie consent

`ConsentProvider` gates PostHog init. Analytics runs only when `consent.analytics === true`.

## Admin analytics

`/admin/analytics` — requires `ADMIN_EMAILS` or `role === ADMIN`.

Shows: total users, premium users, total readings, readings today, signups (7d), conversion rate, charts, funnels. Data from Postgres + optional PostHog HogQL.

## Reliability utilities

| Utility | Path |
|---------|------|
| Global error UI | `app/error.tsx`, `app/global-error.tsx` |
| Segment boundary | `components/errors/react-error-boundary.tsx` |
| Loading states | `app/loading.tsx`, `app/admin/loading.tsx` |
| Request timeout | `lib/monitoring/request-timeout.ts` |
| AI retry | `lib/monitoring/ai-client.ts` + `lib/trust/retry.ts` |
| Central logging | `lib/monitoring/logger.ts` |

## Security practices

- Never log passwords, API keys, or full I Ching questions.
- Use `sanitizeAnalyticsProperties` / `sanitizeMonitoringContext` for custom payloads.
- Keep `sendDefaultPii: false` in Sentry.
- Rate-limit `/api/monitoring/client-error`.
- Run PostHog EU region for DE users when possible.

## Local development

- Sentry: set DSN to a dev project or leave unset (no-op).
- PostHog: omit key to disable client capture; DB events still persist if you call `trackServerEvent`.
- Admin: set `ADMIN_EMAILS=your@email.com`.

## Custom error example

```ts
import { captureException, addBreadcrumb } from "@/lib/monitoring/sentry";

addBreadcrumb("Reading stream started");
try {
  await streamInterpretation();
} catch (error) {
  captureException(error, { category: "reading_stream", userId });
}
```

See `lib/monitoring/example-usage.ts`.
