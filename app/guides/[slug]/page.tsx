import { notFound } from "next/navigation";
import Link from "next/link";
import { ContentBlocks, FaqSection } from "@/components/seo/content-blocks";
import { SeoPageShell } from "@/components/seo/seo-page-shell";
import { TableOfContents } from "@/components/seo/table-of-contents";
import { RelatedHexagramLinks } from "@/components/seo/internal-links";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getProgrammaticPage,
  listProgrammaticPaths,
} from "@/lib/seo/programmatic-registry";
import {
  JsonLd,
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
} from "@/lib/seo/schema";

export const revalidate = 86400;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listProgrammaticPaths().map((path) => ({
    slug: path.replace("/guides/", ""),
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = getProgrammaticPage(slug);
  if (!page || page.noindex) return {};
  return buildPageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: page.canonicalPath,
    noindex: page.noindex,
  });
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const page = getProgrammaticPage(slug);
  if (!page) notFound();

  const toc = page.blocks.map((b) => ({ id: b.id, label: b.heading }));

  const schemas = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
      { name: page.title, path: page.canonicalPath },
    ]),
    articleSchema({
      title: page.metaTitle,
      description: page.metaDescription,
      path: page.canonicalPath,
      publishedAt: new Date().toISOString(),
    }),
    faqPageSchema(page.faqs),
  ].filter(Boolean);

  return (
    <>
      {schemas.map((schema, i) =>
        schema ? <JsonLd key={i} data={schema} /> : null,
      )}
      <SeoPageShell
        path={page.canonicalPath}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides" },
          { label: page.title },
        ]}
        eyebrow="Guide"
        title={page.title}
        subtitle={page.metaDescription}
      >
        {page.hexagramNumber ? (
          <p className="text-sm">
            <Link
              href={`/hexagrams/${page.hexagramNumber}`}
              className="text-amber-gold hover:underline"
            >
              View Hexagram {page.hexagramNumber} →
            </Link>
          </p>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <TableOfContents items={[...toc, { id: "faq", label: "FAQ" }]} />
          <div className="space-y-10">
            <ContentBlocks blocks={page.blocks} />
            <FaqSection faqs={page.faqs} />
          </div>
        </div>

        {page.hexagramNumber ? (
          <RelatedHexagramLinks numbers={[page.hexagramNumber]} />
        ) : null}
      </SeoPageShell>
    </>
  );
}
