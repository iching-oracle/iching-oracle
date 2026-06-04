import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GuidedReadingFlow } from "@/components/guided-reading/guided-reading-flow";

export const metadata = {
  title: "Guided Reading | ICHING-ORACLE",
  description: "A ritual journey through your first oracle reading",
};

export default async function GuidedReadingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/reading/guided");
  }

  return (
    <div className="mobile-page mobile-page--reading relative max-md:py-4">
      <div className="absolute left-0 right-0 top-4 z-30 flex justify-center px-4 sm:justify-end sm:pr-8">
        <Link
          href="/reading/new"
          className="text-xs text-zen-muted transition-colors hover:text-amber-gold"
        >
          Quick reading →
        </Link>
      </div>
      <GuidedReadingFlow />
    </div>
  );
}
