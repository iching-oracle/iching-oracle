import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BetaProfilePanel } from "@/components/beta/beta-profile-panel";

export const metadata = {
  title: "Beta Profile | I Ching Oracle",
  description: "Your early explorer profile and product updates.",
};

export default async function BetaProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/beta/profile");
  }

  return (
    <div className="relative mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 sm:py-16">
      <div
        className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full bg-cosmic-purple/15 blur-[100px]"
        aria-hidden
      />
      <div className="relative space-y-8">
        <div>
          <Link
            href="/dashboard"
            className="text-xs font-medium uppercase tracking-widest text-zen-muted hover:text-amber-gold"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-4 font-serif text-3xl text-foreground">Beta profile</h1>
          <p className="mt-2 max-w-xl text-sm text-zen-muted">
            Your place in the early community — readings, feedback, and what comes
            next.
          </p>
        </div>
        <BetaProfilePanel />
      </div>
    </div>
  );
}
