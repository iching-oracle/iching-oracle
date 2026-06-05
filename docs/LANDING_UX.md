# Landing emotional UX pass

## Typography

| Role | Font | Class |
|------|------|-------|
| Headlines | Cormorant Garamond | `font-display` |
| Body / UI | Geist Sans | default `body` |
| Chinese accents | Noto Serif SC | `font-serif` |

Loaded in `app/layout.tsx` via `--font-display`.

## Atmosphere (`ambient-background.tsx`)

- Removed SaaS grid
- Paper grain (SVG noise, low opacity)
- Ink diffusion blobs + `animate-fog-drift` / `animate-breathe-glow`
- Restrained concentric ring (`.landing-sacred-ring`)
- Four static particles (`float-particle`, 14s)

## Motion (`lib/landing/motion.ts`)

- Ease: `[0.25, 0.1, 0.25, 1]`
- Duration: ~0.9s reveals
- Viewport: `once`, `-12%` margin
- Respects `prefers-reduced-motion`

## Ritual buttons

Use `landing-btn-primary` / `landing-btn-secondary` on marketing CTAs only—not app auth flows (`auth-btn-*`).

No `hover:scale` on landing buttons; 500–700ms transitions.

## Copy

Single source: `lib/landing/content.ts` + `LANDING_SECTIONS`.

## Mobile

- `landing-section`: `py-20` → `py-32` on md
- Hero: extra top padding, larger line-height
- Thumb targets: `min-h-[48px]` on buttons
