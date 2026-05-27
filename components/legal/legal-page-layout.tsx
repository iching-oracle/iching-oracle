import Link from "next/link";
import type { LegalDocument } from "@/lib/legal/content";
import { buildPageMetadata } from "@/lib/seo/metadata";

const LEGAL_PATHS: Record<string, string> = {
  privacy: "/privacy",
  terms: "/terms",
  disclaimer: "/disclaimer",
  "refund-policy": "/refund-policy",
  cookies: "/cookies",
};

export function legalMetadata(doc: LegalDocument) {
  return buildPageMetadata({
    title: doc.title,
    description: doc.description,
    path: LEGAL_PATHS[doc.slug] ?? `/${doc.slug}`,
  });
}

type LegalPageLayoutProps = {
  doc: LegalDocument;
};

export function LegalPageLayout({ doc }: LegalPageLayoutProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-16">
      <header className="border-b border-white/10 pb-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold">
          Legal
        </p>
        <h1 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
          {doc.title}
        </h1>
        <p className="mt-3 text-sm text-zen-muted">{doc.description}</p>
        <p className="mt-2 text-xs text-zen-muted">
          Last updated: {doc.lastUpdated}
        </p>
      </header>

      <div className="prose-invert mt-10 space-y-10">
        {doc.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="font-serif text-xl text-foreground">
              {section.title}
            </h2>
            {section.paragraphs.map((p, i) => (
              <p
                key={i}
                className="mt-3 text-base leading-relaxed text-foreground/85"
              >
                {p}
              </p>
            ))}
            {section.list ? (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/85">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <footer className="mt-12 flex flex-wrap gap-4 border-t border-white/10 pt-8 text-sm text-zen-muted">
        <Link href="/privacy" className="hover:text-amber-gold">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-amber-gold">
          Terms
        </Link>
        <Link href="/disclaimer" className="hover:text-amber-gold">
          Disclaimer
        </Link>
        <Link href="/cookies" className="hover:text-amber-gold">
          Cookies
        </Link>
        <Link href="/support" className="hover:text-amber-gold">
          Support
        </Link>
      </footer>
    </article>
  );
}
