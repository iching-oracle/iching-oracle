# Beta launch & waitlist — I Ching Oracle

## File structure

```
prisma/schema.prisma              # WaitlistEntry, InviteCode, ProductFeedback, BetaAnnouncement
prisma/migrations/20260601120000_closed_beta/
prisma/migrations/20260603120000_product_feedback_rating/

lib/beta/
  config.ts                       # BETA_INVITE_ONLY, BETA_CREDITS_BONUS
  waitlist.ts                     # joinWaitlist, getBetaProfile
  invites.ts                      # validate, redeem, create, revoke, approve
  invite-code.ts                  # secure random codes
  emails.ts                       # Resend templates
  insights.ts                     # Admin metrics

lib/admin/beta.ts                 # Admin actions + lists

app/api/waitlist/route.ts         # Public waitlist POST (rate limited)
app/api/beta/invite/validate/route.ts
app/api/beta/feedback/route.ts
app/api/admin/beta/route.ts         # Admin CRUD

app/beta/page.tsx                 # Waitlist landing
app/register/page.tsx             # Gated signup
app/admin/beta/page.tsx           # Admin dashboard

components/beta/
  beta-waitlist-form.tsx
  beta-landing-page.tsx
  beta-access-gate.tsx
  beta-feedback-widget.tsx
  register-page-content.tsx
components/landing/waitlist-section.tsx
```

## Environment variables

```bash
# Closed beta — require invite on /register
BETA_INVITE_ONLY=true

# Bonus credits on invite redemption (default 50)
BETA_CREDITS_BONUS=50

# Optional per-feature flags
# BETA_FEATURE_INSIGHTS_BETA=true

# Resend (required for waitlist + invite emails)
RESEND_API_KEY=re_...
EMAIL_FROM=I Ching Oracle <noreply@contact.ichingoracle.de>
NEXT_PUBLIC_APP_URL=https://www.ichingoracle.de

# Admin access
ADMIN_EMAILS=you@example.com
```

## Database setup

```bash
npx prisma migrate deploy
npx prisma generate
```

## Flows

### Waitlist

1. User submits email on `/beta`, homepage `#beta-waitlist`, or register gate.
2. `POST /api/waitlist` → `WaitlistEntry` (duplicate-safe), confirmation email.
3. Rate limit: 8 requests / IP / hour.

### Invite

1. Admin: `/admin/beta` → **Approve & email** or **Generate invite**.
2. Creates `InviteCode` (secure random, optional expiry, max uses).
3. Sends `sendBetaInviteEmail` with `/register?invite=CODE`.

### Registration (invite-only)

1. Set `BETA_INVITE_ONLY=true`.
2. `/register` without `?invite=` shows waitlist gate.
3. With invite: live validation → register → redeem → welcome email + bonus credits.

### Feedback

- Logged-in users see **Feedback** FAB (bottom-right).
- Types: pulse (1–5 stars), bug, feature.
- Stored in `ProductFeedback`; thank-you email if logged in.

## Admin (`/admin/beta`)

- Metrics: waitlist, conversion, invites, feedback, resonance, retention
- Approve waitlist → email invite
- Generate / revoke invites
- Recent signups & feedback

## Vercel deployment

1. Set env vars above on Production (and Preview if testing beta).
2. Run migrations against production `DATABASE_URL` (direct URL for migrate).
3. Enable `BETA_INVITE_ONLY=true` when ready to close public signup.
4. Point `ADMIN_EMAILS` to operator addresses.

## Public launch checklist

1. Set `BETA_INVITE_ONLY=false` (or remove).
2. Keep waitlist section for marketing optional.
3. Archive unused invite codes in admin.

## API reference

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `POST /api/waitlist` | Public | Join waitlist |
| `POST /api/beta/invite/validate` | Public | Check invite code |
| `POST /api/beta/feedback` | Optional session | Submit feedback |
| `GET /api/admin/beta` | Admin | Metrics + lists |
| `POST /api/admin/beta` | Admin | approve_waitlist, create_invite, revoke_invite |
