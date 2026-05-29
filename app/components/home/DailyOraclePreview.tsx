import Link from "next/link";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { getTodayOracleTeaser } from "@/lib/daily-oracle/service";
import { resolveValidUserId } from "@/lib/daily-oracle/identity";
import { VISITOR_COOKIE_NAME } from "@/lib/daily-oracle/visitor";
import { getHexagram } from "@/lib/hexagrams";

export async function DailyOraclePreview() {
  const session = await auth();
  const cookieStore = await cookies();
  const visitorKey = cookieStore.get(VISITOR_COOKIE_NAME)?.value?.trim();
  const userId = await resolveValidUserId(session?.user?.id);

  const teaser = await getTodayOracleTeaser(userId, visitorKey ?? null);
  const hex = getHexagram(teaser.hexagramNumber);

  return (
    <section className="mt-16" aria-labelledby="daily-oracle-heading">
      <div className="relative mx-auto max-w-2xl">
        <div
          className="absolute -inset-px rounded-2xl bg-gradient-to-r from-amber-gold/25 via-cosmic-violet/15 to-amber-gold/25 opacity-60 blur-[1px]"
          aria-hidden
        />
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zen-surface/90 px-8 py-10 shadow-[inset_0_1px_0_rgba(197,160,89,0.1)] backdrop-blur-md">
          <p
            id="daily-oracle-heading"
            className="text-center text-[10px] font-medium uppercase tracking-[0.4em] text-zen-muted"
          >
            Daily Oracle
          </p>
          <p className="mb-4 text-center font-serif text-sm tracking-widest text-amber-gold/80">
            今日之卦
          </p>

          <p className="text-center text-xs uppercase tracking-widest text-cosmic-violet">
            Hexagram {hex.number} · {hex.chineseName}
          </p>
          <p className="mt-2 text-center font-serif text-lg text-foreground/95">
            {hex.title}
          </p>

          <p className="mt-6 text-center text-sm leading-relaxed text-foreground/80 line-clamp-3">
            {teaser.oracleMessage}
          </p>

          <blockquote className="mt-5 text-center text-sm italic text-zen-muted">
            &ldquo;{teaser.reflectionQuote}&rdquo;
          </blockquote>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-gold/80 to-cosmic-violet/60"
                style={{ width: `${teaser.energyLevel}%` }}
              />
            </div>
            <Link
              href="/daily"
              className="inline-flex items-center justify-center rounded-full border border-amber-gold/40 bg-amber-gold/10 px-6 py-2.5 text-xs font-medium uppercase tracking-widest text-amber-glow transition-all hover:border-amber-gold/60 hover:bg-amber-gold/20 hover:shadow-[0_0_32px_-8px_rgba(197,160,89,0.5)]"
            >
              Open full daily oracle
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
