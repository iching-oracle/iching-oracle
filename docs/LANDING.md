# Homepage landing page

## Structure

```
app/page.tsx                          # Server: auth + SEO metadata
components/landing/
  landing-page.tsx                    # Section orchestration
  ambient-background.tsx              # Static glow + grid
  hexagram-mark.tsx                   # Animated Li trigram (hero)
  section-header.tsx                  # Shared eyebrow + title
  hero-section.tsx                    # Headline + CTAs
  trust-section.tsx                   # 5 trust pillars
  how-it-works-section.tsx            # 3-step flow
  methods-section.tsx                 # Divination methods
  premium-section.tsx                 # Free vs Premium cards
  testimonials-section.tsx            # Placeholder quotes
  final-cta-section.tsx               # Bottom conversion block
lib/landing/
  content.ts                          # Copy constants
  plans.ts                            # Plan features + price formatter
```

## Animations (Framer Motion)

| Section | Animation |
|---------|-----------|
| Hero | Scale-in mark, stagger headline/CTAs |
| HexagramMark | Lines rise with 80ms stagger |
| Other sections | `whileInView` fade + y, `viewport: { once: true }` |
| Premium card | Subtle radial pulse on gold panel |

All motion respects `useReducedMotion()` → instant render when user prefers reduced motion (also covered by `globals.css`).

## Responsive behavior

- Hero: single column, stacked CTAs on mobile (`flex-col` → `sm:flex-row`)
- Trust: 1 → 2 → 3 columns
- How it works: stacked → 3-column with connector line on `lg`
- Pricing: stacked → 2-column at `lg`
- Testimonials: 1 → 3 columns

## CTAs

| State | Primary | Secondary |
|-------|---------|-------------|
| Guest | `/register` | `/pricing` |
| Logged in | `/reading/guided` | `/pricing` |

## Customize copy

Edit `lib/landing/content.ts` and `lib/landing/plans.ts`.

## Replace testimonials

Update `LANDING_TESTIMONIALS` in `content.ts` with real user quotes (with permission).
