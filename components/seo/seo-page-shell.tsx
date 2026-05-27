import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { CtaOracle } from "@/components/seo/cta-oracle";
import { SeoTracker } from "@/components/seo/seo-tracker";

type SeoPageShellProps = {
  path: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showCta?: boolean;
};

export function SeoPageShell({
  path,
  breadcrumbs,
  eyebrow,
  title,
  subtitle,
  children,
  showCta = true,
}: SeoPageShellProps) {
  return (
    <div className="relative mx-auto min-h-[80vh] w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <SeoTracker path={path} />
      <div
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-cosmic-purple/15 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-amber-gold/10 blur-[90px]"
        aria-hidden
      />

      <div className="relative space-y-10">
        <Breadcrumbs items={breadcrumbs} />
        <header className="space-y-3">
          {eyebrow ? (
            <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-lg leading-relaxed text-zen-muted">{subtitle}</p>
          ) : null}
        </header>
        {children}
        {showCta ? <CtaOracle /> : null}
      </div>
    </div>
  );
}
