import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function PaymentSuccessRedirect({
  searchParams,
}: PageProps) {
  const { session_id: sessionId } = await searchParams;
  redirect(sessionId ? `/success?session_id=${sessionId}` : "/success");
}
