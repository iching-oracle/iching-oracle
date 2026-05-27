import { notFound } from "next/navigation";
import Link from "next/link";
import { getLearnArticle, LEARN_ARTICLES } from "@/lib/content/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SeoPageShell } from "@/components/seo/seo-page-shell";
import { TableOfContents } from "@/components/seo/table-of-contents";
import {
  JsonLd,
  articleSchema,
  breadcrumbSchema,
} from "@/lib/seo/schema";

export const revalidate = 86400;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return LEARN_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = getLearnArticle(slug);
  if (!article) return {};
  return buildPageMetadata({
    title: article.title,
    description: article.description,
    path: `/learn/${article.slug}`,
    ogType: "article",
    publishedTime: article.publishedAt,
  });
}

export default async function LearnArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getLearnArticle(slug);
  if (!article) notFound();

  const path = `/learn/${article.slug}`;
  const toc = article.sections.map((s) => ({ id: s.id, label: s.heading }));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Learn", path: "/learn" },
            { name: article.title, path },
          ]),
          articleSchema({
            title: article.title,
            description: article.description,
            path,
            publishedAt: article.publishedAt,
          }),
        ]}
      />
      <SeoPageShell
        path={path}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Learn", href: "/learn" },
          { label: article.title },
        ]}
        eyebrow="Essay"
        title={article.title}
        subtitle={article.description}
      >
        <p className="text-xs text-zen-muted">
          {article.readingMinutes} min read ·{" "}
          <time dateTime={article.publishedAt}>{article.publishedAt}</time>
        </p>

        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <TableOfContents items={toc} />
          <article className="space-y-10">
            {article.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="font-serif text-xl text-foreground">
                  {section.heading}
                </h2>
                <p className="mt-3 whitespace-pre-wrap leading-relaxed text-foreground/90">
                  {section.body}
                </p>
              </section>
            ))}
          </article>
        </div>

        <section className="rounded-2xl border border-white/10 p-6">
          <h2 className="text-xs font-medium uppercase tracking-widest text-amber-gold">
            Related
          </h2>
          <ul className="mt-3 space-y-2">
            {LEARN_ARTICLES.filter((a) => a.slug !== article.slug)
              .slice(0, 3)
              .map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/learn/${a.slug}`}
                    className="text-sm text-zen-muted hover:text-amber-gold"
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </SeoPageShell>
    </>
  );
}
