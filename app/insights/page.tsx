import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { InsightsPageContent } from "@/components/insights/InsightsPageContent";
import { getInsightsPagePayload } from "@/lib/insights/service";
import { localeForLanguage } from "@/lib/i18n/languages";
import { prisma } from "@/lib/prisma";
import { getPreferredLanguageForUser } from "@/lib/user/preferred-language";

export const metadata = {
  title: "Pattern Insight | ICHING-ORACLE",
  description: "AI-driven patterns across your I Ching reading history",
};

type PageProps = {
  searchParams: Promise<{ refresh?: string }>;
};

export default async function InsightsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/insights");
  }

  const params = await searchParams;
  if (params.refresh === "1") {
    await prisma.patternInsightCache.deleteMany({
      where: { userId: session.user.id },
    });
  }

  const [language] = await Promise.all([
    getPreferredLanguageForUser(session.user.id),
  ]);
  const locale = localeForLanguage(language);
  const data = await getInsightsPagePayload(session.user.id, locale);

  return (
    <div className="relative min-h-full overflow-hidden bg-zen-bg">
      <div
        className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-cosmic-purple/12 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-gold/8 blur-[100px]"
        aria-hidden
      />

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12 sm:px-10 sm:py-16">
        <InsightsPageContent data={data} />
        <Link
          href="/dashboard"
          className="mt-12 inline-block text-sm text-zen-muted transition-colors hover:text-amber-gold"
        >
          ← Dashboard
        </Link>
      </main>
    </div>
  );
}
