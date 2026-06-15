import { LANDING_COMMUNITY_QUOTE } from "@/lib/landing/content";

export function CommunityQuoteSection() {
  return (
    <section
      className="py-10 sm:py-14"
      aria-label="Community wisdom"
    >
      <figure className="landing-community-quote mx-auto max-w-2xl text-center">
        <blockquote>
          <p className="font-display text-xl leading-[1.55] text-foreground/92 sm:text-2xl sm:leading-[1.5]">
            <span
              className="mr-1 font-serif text-amber-gold/50"
              aria-hidden
            >
              &ldquo;
            </span>
            {LANDING_COMMUNITY_QUOTE.quote}
            <span
              className="ml-0.5 font-serif text-amber-gold/50"
              aria-hidden
            >
              &rdquo;
            </span>
          </p>
        </blockquote>
        <figcaption className="mt-5 text-sm text-zen-muted/90">
          — {LANDING_COMMUNITY_QUOTE.attribution}
        </figcaption>
      </figure>
    </section>
  );
}
