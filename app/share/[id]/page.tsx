import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingShareCard } from "@/components/share/reading-share-card";
import { getPublicSharePayload } from "@/lib/share/public-query";
import type { Metadata } from "next";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const payload = await getPublicSharePayload(id);

  if (!payload) {
    return {
      title: "Reading not found | IChing Oracle",
      robots: { index: false, follow: false },
    };
  }

  const { data } = payload;
  const description = data.quote.slice(0, 160);

  return {
    title: `Oracle Reading | IChing Oracle`,
    description,
    openGraph: {
      title: "I Ching Oracle Reading",
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "I Ching Oracle Reading",
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function PublicSharePage({ params }: PageProps) {
  const { id } = await params;
  const payload = await getPublicSharePayload(id);

  if (!payload) {
    notFound();
  }

  const { data } = payload;
  const previewScale = Math.min(1, 360 / 1080);

  return (
    <div className="relative mx-auto min-h-[80vh] w-full max-w-lg px-4 py-12 sm:px-6">
      <div
        className="pointer-events-none absolute left-1/2 top-8 h-48 w-48 -translate-x-1/2 rounded-full bg-cosmic-purple/20 blur-[80px]"
        aria-hidden
      />

      <div className="relative space-y-8 text-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-amber-gold">
            IChing Oracle
          </p>
          <h1 className="mt-2 font-serif text-2xl text-foreground">
            Shared reading
          </h1>
        </div>

        <div className="flex justify-center overflow-hidden rounded-2xl border border-amber-gold/20 bg-black/30 py-8">
          <div
            style={{
              width: 1080 * previewScale,
              height: 1080 * previewScale,
            }}
          >
            <div
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
                width: 1080,
                height: 1080,
              }}
            >
              <ReadingShareCard
                data={data}
                theme="midnight-gold"
                format="square"
                showWatermark
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/reading/new" className="auth-btn-primary inline-flex">
            Create your first oracle reading
          </Link>
          <p className="text-xs text-zen-muted">
            <Link href="/" className="hover:text-amber-gold">
              iching-oracle.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
