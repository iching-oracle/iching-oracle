import Link from "next/link";
import type { LegalDocument } from "@/lib/legal/content";
import { buildPageMetadata } from "@/lib/seo/metadata";

const LEGAL_PATHS: Record<string, string> = {
  privacy: "/privacy",
  terms: "/terms",
  impressum: "/impressum",
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
  const showToc = doc.sections.length >= 4;

  return (
    <div className="relative min-h-full overflow-hidden bg-zen-bg">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-cosmic-purple/10 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-amber-gold/6 blur-[90px]"
        aria-hidden
      />

      <article className="relative z-10 mx-auto max-w-3xl px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-16 lg:max-w-4xl">
        <header className="border-b border-white/[0.08] pb-8">
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold">
            Legal
          </p>
          <h1 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
            {doc.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zen-muted">
            {doc.description}
          </p>
          <p className="mt-3 text-xs text-zen-muted/80">
            Last updated:{" "}
            <time dateTime={doc.lastUpdated}>{doc.lastUpdated}</time>
          </p>
        </header>

        {showToc ? (
          <nav
            aria-label="On this page"
            className="mt-8 rounded-xl border border-white/[0.06] bg-zen-surface/40 px-4 py-4 sm:px-5"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-zen-muted">
              On this page
            </p>
            <ol className="mt-3 columns-1 gap-x-8 text-sm sm:columns-2">
              {doc.sections.map((section) => (
                <li key={section.id} className="mb-1.5 break-inside-avoid">
                  <a
                    href={`#${section.id}`}
                    className="text-foreground/75 transition-colors hover:text-amber-gold"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="mt-10 space-y-12 sm:mt-12">
          {doc.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28 border-b border-white/[0.04] pb-10 last:border-0 last:pb-0"
            >
              <h2 className="font-serif text-xl text-foreground sm:text-2xl">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4">
                {section.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="text-[15px] leading-[1.75] text-foreground/88 sm:text-base"
                  >
                    {p}
                  </p>
                ))}
              </div>
              {section.list ? (
                <ul className="mt-4 space-y-2.5 border-l border-amber-gold/20 pl-4 text-[15px] leading-relaxed text-foreground/85 sm:pl-5 sm:text-base">
                  {section.list.map((item) => (
                    <li key={item} className="pl-1">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <footer className="mt-14 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.08] pt-8 text-sm text-zen-muted">
          <Link
            href="/privacy"
            className="transition-colors hover:text-amber-gold"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="transition-colors hover:text-amber-gold"
          >
            Terms of Service
          </Link>
          <Link
            href="/impressum"
            className="transition-colors hover:text-amber-gold"
          >
            Impressum
          </Link>
          <Link
            href="/support"
            className="transition-colors hover:text-amber-gold"
          >
            Contact
          </Link>
          <Link
            href="/cookies"
            className="transition-colors hover:text-amber-gold"
          >
            Cookies
          </Link>
        </footer>
      </article>
    </div>
  );
}
