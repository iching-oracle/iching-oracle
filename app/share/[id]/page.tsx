import { notFound } from "next/navigation";
import { PublicShareReadingView } from "@/components/share/public-share-reading-view";
import { buildSharePageMetadata } from "@/lib/seo/share-metadata";
import { getPublicSharePayload } from "@/lib/share/public-query";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return buildSharePageMetadata(id);
}

export default async function PublicSharePage({ params }: PageProps) {
  const { id } = await params;
  const reading = await getPublicSharePayload(id, { trackView: true });

  if (!reading) {
    notFound();
  }

  return <PublicShareReadingView reading={reading} />;
}
