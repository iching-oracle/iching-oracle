import Link from "next/link";
import { LEARN_ARTICLES } from "@/lib/content/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SeoPageShell } from "@/components/seo/seo-page-shell";

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: "Learn the I Ching",
  description:
    "Mystical essays on casting, changing lines, and AI-assisted divination in the modern age.",
  path: "/learn",
});

export default function LearnIndexPage() {
  return (
    <SeoPageShell
      path="/learn"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Learn" },
      ]}
      eyebrow="Library"
      title="Learn the I Ching"
      subtitle="Contemplative articles — not a generic blog, but a quiet study hall for the oracle."
    >
      <ul className="space-y-6">
        {LEARN_ARTICLES.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/learn/${article.slug}`}
              className="group block rounded-2xl border border-white/10 bg-zen-surface/30 p-6 transition-colors hover:border-amber-gold/25"
            >
              <h2 className="font-serif text-xl text-foreground group-hover:text-amber-gold">
                {article.title}
              </h2>
              <p className="mt-2 text-sm text-zen-muted">{article.description}</p>
              <p className="mt-3 text-xs text-zen-muted">
                {article.readingMinutes} min read · {article.publishedAt}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </SeoPageShell>
  );
}
