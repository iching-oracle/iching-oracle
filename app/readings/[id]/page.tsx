import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getHexagram } from "@/lib/iching/hexagrams";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Reading ${id.slice(0, 8)}… | ICHING-ORACLE`,
  };
}

export default async function ReadingDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const reading = await prisma.reading.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!reading) notFound();

  const hex = getHexagram(reading.hexagram);
  const date = new Intl.DateTimeFormat("zh-Hant", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(reading.createdAt);

  return (
    <div className="relative mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <div
        className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full bg-cosmic-purple/15 blur-[100px]"
        aria-hidden
      />

      <div className="relative space-y-8">
        <div>
          <Link
            href="/dashboard"
            className="text-xs font-medium uppercase tracking-widest text-zen-muted transition-colors hover:text-amber-gold"
          >
            ← Dashboard
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-cosmic-violet">
            Your Reading
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">
            {hex.nameZh}
            <span className="ml-2 text-xl font-normal text-zen-muted">
              {hex.nameEn}
            </span>
          </h1>
          <p className="mt-1 text-sm text-zen-muted">{date}</p>
        </div>

        <div className="rounded-2xl border border-amber-gold/20 bg-zen-surface/70 p-6 backdrop-blur-xl">
          <p className="text-xs font-medium uppercase tracking-widest text-amber-gold">
            Hexagram {reading.hexagram}
          </p>
          <p className="mt-2 font-serif text-lg text-foreground/90">
            {hex.summary}
          </p>
          {reading.changing ? (
            <p className="mt-3 text-sm text-cosmic-violet">
              Changing lines (from bottom): {reading.changing}
            </p>
          ) : (
            <p className="mt-3 text-sm text-zen-muted">No changing lines</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-zen-surface/70 p-6 backdrop-blur-xl">
          <p className="text-xs font-medium uppercase tracking-widest text-zen-muted">
            Your question
          </p>
          <blockquote className="mt-3 font-serif text-xl leading-relaxed text-foreground">
            「{reading.question}」
          </blockquote>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zen-surface/70 p-6 backdrop-blur-xl">
          <p className="text-xs font-medium uppercase tracking-widest text-zen-muted">
            Interpretation
          </p>
          <div className="mt-4 space-y-4">
            {reading.interpretation.split("\n\n").map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="text-sm leading-relaxed text-foreground/90"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <Link href="/reading/new" className="auth-btn-primary inline-flex">
          Ask another question
        </Link>
      </div>
    </div>
  );
}
