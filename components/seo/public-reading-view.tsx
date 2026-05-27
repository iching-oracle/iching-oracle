import Link from "next/link";
import { HexagramDisplay } from "@/components/HexagramDisplay";
import { SeoPageShell } from "@/components/seo/seo-page-shell";
import { RelatedHexagramLinks } from "@/components/seo/internal-links";
import { getRelatedHexagramNumbers } from "@/lib/seo/hexagram-related";
import {
  JsonLd,
  articleSchema,
  breadcrumbSchema,
  creativeWorkSchema,
} from "@/lib/seo/schema";
import type { PublicReadingSeoPayload } from "@/types/seo";

type PublicReadingViewProps = {
  reading: PublicReadingSeoPayload;
  relatedSlugs?: Array<{ slug: string; title: string }>;
};

export function PublicReadingView({
  reading,
  relatedSlugs = [],
}: PublicReadingViewProps) {
  const path = `/reading/${reading.publicSlug}`;
  const published = reading.publishedAt.toISOString();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Oracle Reading", path },
          ]),
          articleSchema({
            title: reading.primaryTitle,
            description: reading.summary,
            path,
            publishedAt: published,
          }),
          creativeWorkSchema({
            name: reading.primaryTitle,
            description: reading.summary,
            path,
          }),
        ]}
      />
      <SeoPageShell
        path={path}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Public Reading" },
        ]}
        eyebrow="Oracle Reading"
        title={reading.primaryTitle}
        subtitle={reading.question}
      >
        <div className="flex flex-wrap items-center gap-4 text-xs text-zen-muted">
          <span>{reading.viewCount} views</span>
          <span>{reading.shareCount} shares</span>
          <time dateTime={published}>
            {new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
              reading.publishedAt,
            )}
          </time>
        </div>

        <div className="flex justify-center py-6">
          <HexagramDisplay hexagramNumber={reading.hexagram} size="lg" />
        </div>

        <blockquote className="border-l-2 border-amber-gold/40 pl-4 font-serif text-lg italic text-zen-muted">
          {reading.summary}
        </blockquote>

        <section className="rounded-2xl border border-white/10 bg-zen-surface/50 p-6 sm:p-8">
          <h2 className="text-xs font-medium uppercase tracking-widest text-amber-gold">
            Interpretation
          </h2>
          <div className="prose prose-invert mt-4 max-w-none whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {reading.interpretation.slice(0, 4000)}
          </div>
        </section>

        <RelatedHexagramLinks
          numbers={getRelatedHexagramNumbers(reading.hexagram)}
        />

        {relatedSlugs.length > 0 && (
          <section className="rounded-2xl border border-white/10 p-6">
            <h2 className="text-xs font-medium uppercase tracking-widest text-amber-gold">
              Related readings
            </h2>
            <ul className="mt-4 space-y-2">
              {relatedSlugs.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/reading/${r.slug}`}
                    className="text-sm text-zen-muted hover:text-amber-gold"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </SeoPageShell>
    </>
  );
}
