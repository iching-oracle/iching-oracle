# Typography system

## Font pairing

| Role | Font | Class |
|------|------|-------|
| Headlines & prices | Cormorant Garamond | `font-display` / `type-display` |
| Body & UI | Geist Sans | default `body` |
| Hexagram names only | Noto Serif SC | `font-hexagram` / `<HexagramName>` |

**Rule:** Never use `font-hexagram` for English UI. Never mix Noto into `font-display`.

## Semantic classes (`globals.css`)

```html
<h1 class="type-display text-4xl">Headline</h1>
<p class="type-eyebrow">Section label</p>
<p class="type-body">Primary copy</p>
<p class="type-muted">Secondary copy</p>
<HexagramName size="lg">乾</HexagramName>
<PriceAmount value="€9.99" variant="gold" suffix="/ month" />
```

## Pricing

- Currency symbol at **55%** scale (`.price-currency`)
- Numerals with tight kerning (`.price-numeral`, `-0.035em`)
- Suffix in Geist sans (`.price-amount-suffix`)
- Shared cards: `.pricing-card`, `.pricing-card--premium`

## Chinese usage

**Allowed:** hexagram characters, single ceremonial glyphs (methods: 籌 錢 念)

**Avoid:** Chinese headlines, bilingual labels, mixed paragraphs in marketing UI

## Components

- `components/pricing/price-amount.tsx`
- `components/pricing/pricing-plan-cards.tsx`
- `components/typography/hexagram-name.tsx`
