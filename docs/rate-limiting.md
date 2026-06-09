# Rate limiting & abuse prevention

Production-grade protection for auth, AI generation, public APIs, and Stripe endpoints.

## Architecture

```
Request
  → proxy.ts (edge IP block via Upstash REST)
  → API route
      → guardPublicRoute / guardAiRoute / guardAuthRoute / guardStripeRoute
          → maintenance & AI kill switch
          → IP burst / temporary block (Redis)
          → Upstash sliding-window limits (fallback: Prisma RateLimitBucket)
          → tier limits (guest / free / premium; admin bypass)
          → global AI caps (hourly generations, daily tokens)
      → credits check (assertCreditsForFeature)
      → AI call (fetchAiCompletion with timeout + bounded retry)
      → AIUsage row + estimatedCostUsd
```

### Key modules

| Module | Role |
|--------|------|
| `lib/rate-limit.ts` | Upstash-first rate limit facade; tier enforcement |
| `lib/rate-limit/abuse.ts` | Burst tracking, failed-request counters, IP blocks |
| `lib/rate-limit/plan-limits.ts` | Per-tier presets from env |
| `lib/protection/config.ts` | Central env configuration |
| `lib/protection/ai-guard.ts` | Global hourly/daily AI caps |
| `lib/protection/maintenance.ts` | Maintenance mode & AI disabled responses |
| `lib/usage-tracking.ts` | Cost estimation, user summaries, admin stats |
| `lib/api/route-guard.ts` | Reusable route guards |
| `proxy.ts` | Edge IP block before NextAuth |

## Limit strategy

### Layers (checked in order)

1. **Edge IP block** — abusive IPs blocked in Redis (`abuse:block:{ip}`).
2. **Maintenance / AI kill switch** — env flags or Redis `protection:ai:emergency=1`.
3. **IP preset limits** — per-endpoint windows (register, auth, share, etc.).
4. **API burst** — per-user/IP requests per minute by tier.
5. **Tier AI limits** — hourly + daily generation caps.
6. **Reading cooldown** — minimum seconds between readings (free/guest stricter).
7. **Global caps** — platform-wide hourly generations and daily token budget.
8. **Credits** — existing credit balance checks.

### Tiers

| Tier | Who | Notes |
|------|-----|-------|
| Guest | Unauthenticated IP | Very low AI + API limits |
| Free | Signed-in free plan | Daily generation limits + cooldown |
| Premium | Active subscription | Higher limits, shorter cooldown |
| Admin | `role === ADMIN` | Bypasses tier limits |

Configure via `RATE_*` env vars in `.env.example`.

## Abuse prevention

- **Burst detection**: > `ABUSE_BURST_PER_MINUTE` requests/minute from one IP → temporary block.
- **Failed requests**: > `ABUSE_FAIL_THRESHOLD` failures in 5 minutes → temporary block.
- **Triggers**: invalid invite codes, Stripe signature failures, optional `trackAbuse` on route errors.
- **Logging**: blocks recorded as `SystemEvent` with `category: abuse`.
- **Admin visibility**: `/admin/usage` shows suspicious events and top consumers.

## Emergency procedures

### Pause all AI immediately

1. Set `AI_DISABLED=true` or `EMERGENCY_AI_KILL_SWITCH=true` in Vercel env → redeploy.
2. Or set Redis key `protection:ai:emergency` to `1` (no redeploy; checked on each AI request).

### Full maintenance mode

Set `MAINTENANCE_MODE=true` — public APIs return 503 with a friendly message.

### Reduce spend without full shutdown

- Lower `AI_GLOBAL_HOURLY_GENERATION_CAP` or `AI_GLOBAL_DAILY_TOKEN_CAP`.
- Tighten `RATE_FREE_*` / `RATE_PREMIUM_*` values.
- Block a specific IP: set `abuse:block:{ip}` in Upstash to a future Unix-ms timestamp.

### Restore service

1. Clear emergency Redis key: `DEL protection:ai:emergency`
2. Unset `AI_DISABLED` / `MAINTENANCE_MODE`
3. Monitor `/admin/usage` for cost and abuse trends

## Fallback behavior

If Upstash is not configured, `lib/rate-limit.ts` falls back to Prisma `RateLimitBucket` (existing table). Edge IP guard is skipped without Upstash credentials.

Rate limits are **enforced in production** by default. Set `ENFORCE_RATE_LIMIT=true` locally to test.

## Testing locally

1. Create a free [Upstash Redis](https://upstash.com) database.
2. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env`.
3. Set `ENFORCE_RATE_LIMIT=true`.
4. Lower limits for quick feedback, e.g. `RATE_FREE_AI_PER_HOUR=2`.
5. Hit an AI endpoint repeatedly; expect `429` with `retryAfterSec`, `remaining`, `limit`.
6. Check `/admin/usage` (admin session required) for aggregated stats.

### Example curl

```bash
# Rapid register attempts (expect 429)
for i in $(seq 1 10); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@example.com","password":"short"}'
done
```

## Production recommendations

- **Always configure Upstash** on Vercel (same region as deployment when possible).
- Set **global caps** (`AI_GLOBAL_HOURLY_GENERATION_CAP`, `AI_GLOBAL_DAILY_TOKEN_CAP`) to values above expected peak with headroom.
- Enable **Sentry** to correlate AI timeouts and rate-limit spikes.
- Review `/admin/usage` daily during launch week.
- Keep `AI_MAX_RETRIES` low (2) to avoid retry storms on provider outages.
- Use Stripe webhook rate limit (`RATE_LIMITS.stripeWebhook`) — do not disable on production.
- Document on-call runbook: emergency env vars + Redis keys above.
