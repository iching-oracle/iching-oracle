# SEO readiness

Production SEO for I Ching Oracle: sitemap, robots, metadata, structured data, and indexing policy.

## Architecture

| Layer | Implementation |
|-------|----------------|
| Site URL | `NEXT_PUBLIC_APP_URL` / `AUTH_URL` → `lib/seo/site.ts` |
| Metadata base | `metadataBase` in root layout + `buildPageMetadata()` |
| Public pages | `buildPageMetadata()` — canonical, OG, Twitter |
| Private pages | `buildNoIndexMetadata()` — `noindex, nofollow` |
| Share URLs | `buildSharePageMetadata()` — noindex + canonical → `/reading/{slug}` |
| Structured data | `lib/seo/schema.tsx` (WebSite, Organization, FAQ, Article, Breadcrumb) |
| Sitemap | `app/sitemap.ts` — static + hexagrams + guides + learn + public readings |
| Robots | `app/robots.ts` — disallow private/auth paths |
| GSC | `NEXT_PUBLIC_GSC_VERIFICATION` in `.env` |

## Indexing policy

**Indexed:** `/`, `/pricing`, `/hexagrams/*`, `/guides/*`, `/learn/*`, `/reading/{seo-slug}`, legal pages, `/contact`, `/support`, `/daily`, `/trust/ai`

**Not indexed:** dashboard, history, billing, auth, admin, beta, `/share/*`, `/readings/*` (redirects to `/reading/new`), auth-required reading flows

## Duplicate content

- `/share/{id}` → canonical to `/reading/{publicSlug}` when indexable
- `/readings/new` → 308 redirect to `/reading/new`
- Private CUID `/reading/{id}` → `noindex`
- Premium preview readings → excluded from sitemap via `seoIndexable`

## Google Search Console setup

1. Set `NEXT_PUBLIC_APP_URL` to production domain (with `https://www.…`)
2. Add `NEXT_PUBLIC_GSC_VERIFICATION` from Search Console → Settings → Ownership verification
3. Deploy and submit `https://yourdomain.com/sitemap.xml`
4. Inspect homepage URL — confirm canonical, OG image, FAQ schema

## Testing locally

```bash
curl -s http://localhost:3000/robots.txt
curl -s http://localhost:3000/sitemap.xml | head
```

View page source on `/` for JSON-LD (`WebSite`, `WebApplication`, `FAQPage`, `Organization`).

## OG images

Dynamic images via `/api/og?path=…` — requires `metadataBase` for absolute URLs in production.
