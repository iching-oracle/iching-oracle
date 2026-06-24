import Link from "next/link";
import type { PublicSharedReadingPayload } from "@/types/share";
import { ShareCtaButton } from "@/components/share/share-cta-button";
import { SharePageTracker } from "@/components/share/share-page-tracker";

type PublicShareReadingViewProps = {
  reading: PublicSharedReadingPayload;
};

export function PublicShareReadingView({ reading }: PublicShareReadingViewProps) {
  return (
    <div className="relative mx-auto min-h-[80vh] w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <SharePageTracker
        shareId={reading.shareId}
        hexagramNumber={reading.hexagramNumber}
      />

      <div
        className="pointer-events-none absolute -left-8 top-0 h-56 w-56 rounded-full bg-cosmic-purple/15 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-8 top-24 h-48 w-48 rounded-full bg-amber-gold/10 blur-[90px]"
        aria-hidden
      />

      <article className="relative space-y-8">
        <header className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-amber-gold">
            I Ching Oracle
          </p>
          <h1 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
            Hexagram {reading.hexagramNumber}
          </h1>
          <p className="mt-2 text-lg text-amber-glow">
            {reading.hexagramName}{" "}
            <span className="text-zen-muted">({reading.hexagramChineseName})</span>
          </p>
          <p className="mt-3 text-sm text-zen-muted">{reading.dateLabel}</p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-zen-surface/60 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="text-[10px] font-medium uppercase tracking-[0.3em] text-cosmic-violet">
            Question
          </h2>
          <p className="reading-prose mt-4 font-serif text-xl leading-relaxed text-foreground sm:text-2xl">
            {reading.question}
          </p>
        </section>

        <section className="rounded-2xl border border-amber-gold/20 bg-zen-surface/70 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="text-[10px] font-medium uppercase tracking-[0.3em] text-amber-gold">
            Interpretation
          </h2>
          <div className="reading-prose mt-5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 sm:text-base">
            {reading.interpretation}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-zen-surface/80 via-zen-bg/40 to-cosmic-purple/10 p-8 text-center sm:p-10">
          <h2 className="font-serif text-2xl text-foreground">
            Get your own I Ching reading
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zen-muted">
            Consult the oracle with a question of your own — guided, thoughtful,
            and private until you choose to share.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <ShareCtaButton shareId={reading.shareId} />
            <Link
              href="/reading/guided"
              className="text-xs text-zen-muted transition-colors hover:text-amber-gold"
            >
              Or begin a guided reading →
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
