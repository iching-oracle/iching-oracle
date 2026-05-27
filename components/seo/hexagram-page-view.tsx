import { HexagramDisplay } from "@/components/HexagramDisplay";
import { ContentBlocks, FaqSection } from "@/components/seo/content-blocks";
import {
  HexagramTopicLinks,
  RelatedHexagramLinks,
} from "@/components/seo/internal-links";
import { SeoPageShell } from "@/components/seo/seo-page-shell";
import { TableOfContents } from "@/components/seo/table-of-contents";
import type { HexagramSeoContent } from "@/types/seo";
import {
  JsonLd,
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
} from "@/lib/seo/schema";

export function HexagramPageView({ content }: { content: HexagramSeoContent }) {
  const toc = content.blocks.map((b) => ({ id: b.id, label: b.heading }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Hexagrams", href: "/hexagrams" },
    {
      label: `#${content.number}`,
      href: `/hexagrams/${content.number}`,
    },
    ...(content.topic !== "general"
      ? [{ label: content.topic }]
      : [{ label: content.title }]),
  ];

  const schemas = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Hexagrams", path: "/hexagrams" },
      { name: content.title, path: content.canonicalPath },
    ]),
    articleSchema({
      title: content.metaTitle,
      description: content.metaDescription,
      path: content.canonicalPath,
      publishedAt: new Date().toISOString(),
    }),
    faqPageSchema(content.faqs),
  ].filter(Boolean);

  return (
    <>
      {schemas.map((schema, i) =>
        schema ? <JsonLd key={i} data={schema} /> : null,
      )}
      <SeoPageShell
        path={content.canonicalPath}
        breadcrumbs={breadcrumbs}
        eyebrow={`Hexagram ${content.number}`}
        title={content.title}
        subtitle={content.judgment}
      >
        <div className="flex justify-center py-6">
          <HexagramDisplay hexagramNumber={content.number} size="lg" animated />
        </div>
        <p className="text-center font-serif text-4xl text-foreground">
          {content.chineseName}
        </p>

        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <TableOfContents items={[...toc, { id: "faq", label: "FAQ" }]} />
          <div className="space-y-10">
            <ContentBlocks blocks={content.blocks} />
            <FaqSection faqs={content.faqs} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <HexagramTopicLinks number={content.number} />
          <RelatedHexagramLinks numbers={content.relatedHexagrams} />
        </div>
      </SeoPageShell>
    </>
  );
}
