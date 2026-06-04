# Personalized Insight Engine

## Architecture

```
Reading journal (PostgreSQL)
        │
        ▼
lib/insights/analytics.ts      ← deterministic stats (hexagrams, categories, themes)
lib/insights/emotional-analytics.ts
lib/insights/behavioral-trends.ts
        │
        ├─ Free tier: stats + charts + premium gate teaser
        │
        └─ Premium tier:
              PatternInsightCache (24h TTL, revision-keyed)
              InsightReportCache (weekly 7d / monthly 30d TTL)
              DeepSeek via lib/insights/generate.ts + lib/monitoring/ai-client.ts
              Credits: pattern_insight (5 credits, PREMIUM_ONLY)
```

## Data models (Prisma)

| Model | Purpose |
|-------|---------|
| `PatternInsightCache` | Full pattern AI payload per user |
| `InsightReportCache` | Weekly / monthly reflection reports |
| `OracleMilestone` | User-curated milestones & emotional markers |
| `Memory` | Long-term oracle memory (existing; surfaced on timeline) |

## API routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/insights` | GET | Full `InsightsPagePayload` (auth required) |
| `/api/insights/milestones` | GET/POST/DELETE | Milestone CRUD |

Server page: `/insights` — SSR payload; `?refresh=1` invalidates caches and forces regeneration.

## Premium gating

- `isPremiumUser()` in `lib/subscription.ts`
- Non-premium: analytics, charts (blurred), stat teaser, upgrade gate
- Premium: AI summary, weekly/monthly reports, emotional chart, timeline, milestones, deep fields

## Cache invalidation

Call `invalidatePatternInsightCache(userId)` after new readings (see `lib/readings/save-reading.ts`).

## Prompt safety

Shared rails in `lib/insights/prompts.ts` → `INSIGHT_ETHICS_BLOCK`. UI disclaimer: `InsightsAiDisclaimer`.

## Analytics (product)

Track: `insights_page_view`, `pattern_insight_generated`, `milestone_created` (add PostHog events where needed).

## Deploy checklist

1. `npx prisma migrate deploy`
2. `npx prisma generate`
3. Ensure `DEEPSEEK_API_KEY` is set (fallback copy works offline)
