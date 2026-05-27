import type { SeoContentBlock, SeoFaqItem } from "@/types/seo";

export function ContentBlocks({ blocks }: { blocks: SeoContentBlock[] }) {
  return (
    <div className="space-y-10">
      {blocks.map((block) => (
        <section key={block.id} id={block.id} className="scroll-mt-24">
          <h2 className="font-serif text-xl text-foreground">{block.heading}</h2>
          <div className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
            {block.body}
          </div>
        </section>
      ))}
    </div>
  );
}

export function FaqSection({ faqs }: { faqs: SeoFaqItem[] }) {
  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="scroll-mt-24 space-y-4">
      <h2 className="font-serif text-xl text-foreground">Frequently asked</h2>
      <dl className="space-y-6">
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-xl border border-white/10 p-4">
            <dt className="font-medium text-foreground">{faq.question}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-zen-muted">
              {faq.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
