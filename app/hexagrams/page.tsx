import Link from "next/link";
import { HEXAGRAMS } from "@/lib/hexagrams";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SeoPageShell } from "@/components/seo/seo-page-shell";
import { JsonLd, websiteSchema } from "@/lib/seo/schema";

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: "64 Hexagrams — I Ching Reference",
  description:
    "Explore all 64 I Ching hexagrams with traditional meanings, modern interpretation, and AI oracle guidance.",
  path: "/hexagrams",
  keywords: ["i ching hexagrams", "64 hexagrams", "book of changes"],
});

export default function HexagramsIndexPage() {
  const numbers = Object.keys(HEXAGRAMS)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <>
      <JsonLd data={websiteSchema()} />
      <SeoPageShell
        path="/hexagrams"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Hexagrams" },
        ]}
        eyebrow="Knowledge base"
        title="The 64 Hexagrams"
        subtitle="Ancient symbols of change — each a mirror for love, career, spirit, and the turning world."
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {numbers.map((n) => {
            const h = HEXAGRAMS[n]!;
            return (
              <li key={n}>
                <Link
                  href={`/hexagrams/${n}`}
                  className="block rounded-xl border border-white/10 bg-zen-surface/40 px-4 py-3 transition-colors hover:border-amber-gold/30"
                >
                  <span className="text-amber-gold">{n}</span>
                  <span className="mx-2 text-zen-muted">·</span>
                  <span className="font-serif text-foreground">{h.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </SeoPageShell>
    </>
  );
}
