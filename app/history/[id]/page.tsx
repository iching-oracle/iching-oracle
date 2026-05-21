import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function HistoryDetailRedirectPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/readings/${id}`);
}
