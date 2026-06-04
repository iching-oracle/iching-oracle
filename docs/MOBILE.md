# Mobile UX — I Ching Oracle

## Component structure

```
components/mobile/
  mobile-bottom-nav.tsx      # Fixed tab bar (md:hidden)
  mobile-layout-shell.tsx    # Padding + footer hide when nav active
  mobile-page.tsx            # Page rhythm wrapper
  mobile-nav-icons.tsx       # Tab SVG icons
  motion.tsx                 # FadeIn, RitualCard
lib/mobile/nav-tabs.ts       # Tab config + route matching
hooks/use-haptic-feedback.ts # navigator.vibrate on tab tap
app/globals.css              # .mobile-bottom-nav, .reading-prose, .ritual-card
```

## Bottom navigation

| Tab | Route | Active prefixes |
|-----|-------|-----------------|
| Oracle | `/oracle/chat` | `/oracle`, `/reading/guided`, `/reading/new` |
| Daily | `/daily` | `/daily` |
| Insights | `/insights` | `/insights` |
| History | `/history` | `/history`, `/readings` |
| Profile | `/dashboard` | `/dashboard`, `/settings`, `/billing`, `/beta/profile` |

- Renders only when **logged in** and not on auth/marketing routes.
- Hidden from `md` breakpoint up (desktop keeps top nav).
- Safe area: `env(safe-area-inset-bottom)` on nav + main padding.
- Active pill: Framer `layoutId` spring (respects `prefers-reduced-motion`).

## Responsive strategy

| Breakpoint | Navigation |
|------------|------------|
| `< 768px` | Bottom nav + compact header (logo, credits) |
| `≥ 768px` | Desktop navbar + footer |

Use `MobilePage` on authenticated screens for consistent `px-4 py-8` rhythm.

Reading screens: `MobilePage reading focus` → `max-w-2xl`, `reading-prose` typography.

## CSS utilities

| Class | Purpose |
|-------|---------|
| `.tap-feedback` | `active:scale(0.97)` thumb feedback |
| `.reading-prose` | 17px / 1.75 line-height, max 36rem |
| `.ritual-card` | Soft bordered content cards |
| `.mobile-oracle-viewport` | Full-height chat minus header + bottom nav |

## Performance notes

- Animations use `transform` + `opacity` only (GPU-friendly).
- `whileInView` with `once: true` avoids repeat work on scroll.
- Bottom nav uses `backdrop-blur-xl` — single fixed layer.
- `prefers-reduced-motion` disables motion in CSS and Framer hooks.
- Oracle chat height uses `100dvh` with CSS variables (no JS resize).

## Extending

Add a tab in `lib/mobile/nav-tabs.ts` and an icon in `mobile-nav-icons.tsx`.

To hide nav on a route, add prefix to `MOBILE_NAV_HIDDEN_PREFIXES`.
