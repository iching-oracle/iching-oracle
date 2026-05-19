import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

/** Legacy route — redirect to canonical reading page. */
export default async function LegacyReadingPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/reading/${id}`);
}
