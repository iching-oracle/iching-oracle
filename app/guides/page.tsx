import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SeoPageShell } from "@/components/seo/seo-page-shell";
import { buildProgrammaticRegistry } from "@/lib/seo/programmatic-registry";

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: "I Ching Guides & Meanings",
  description:
    "Long-form guides on hexagram meanings, changing lines, relationships, career, and AI oracle wisdom.",
  path: "/guides",
});

export default function GuidesIndexPage() {
  const clusters = buildProgrammaticRegistry().filter(
    (p) => p.type === "topic_cluster",
  );

  return (
    <SeoPageShell
      path="/guides"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Guides" },
      ]}
      eyebrow="Wisdom library"
      title="Guides & meanings"
      subtitle="Keyword-rich paths into the oracle — written for seekers and search engines alike."
    >
      <ul className="space-y-3">
        {clusters.map((page) => (
          <li key={page.slug}>
            <Link
              href={page.canonicalPath}
              className="block rounded-xl border border-white/10 px-4 py-3 hover:border-amber-gold/30"
            >
              <span className="font-serif text-foreground">{page.title}</span>
              <p className="mt-1 text-sm text-zen-muted line-clamp-2">
                {page.metaDescription}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm text-zen-muted">
        Plus {buildProgrammaticRegistry().length} hexagram meaning pages — explore via{" "}
        <Link href="/hexagrams" className="text-amber-gold hover:underline">
          hexagram index
        </Link>
        .
      </p>
    </SeoPageShell>
  );
}
