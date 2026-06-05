# Admin feedback dashboard

## Route

`/admin/feedback` — protected by `app/admin/layout.tsx` → `requireAdminSession()`.

Non-admins redirect to `/dashboard`. Unauthenticated users redirect to `/login?callbackUrl=/admin`.

## Setup

1. Set `ADMIN_EMAILS` in `.env` (comma-separated) or assign `role: ADMIN` in the database.
2. Ensure migration `20260603120000_product_feedback_rating` is applied (`rating` column).
3. Feedback is written via `POST /api/beta/feedback` → `ProductFeedback` table.

## Query params

| Param | Values |
|-------|--------|
| `category` | `all`, `bug`, `feature`, `general`, `emotional` (`ux` type) |
| `sort` | `newest`, `rating_asc`, `rating_desc` |
| `page` | 1-based, 20 rows per page |

## API

`GET /api/admin/feedback` — same payload as the page (admin session required).

## Structure

```
app/admin/feedback/page.tsx
app/admin/feedback/loading.tsx
app/api/admin/feedback/route.ts
lib/admin/feedback.ts
types/admin-feedback.ts
components/admin/feedback/
```
