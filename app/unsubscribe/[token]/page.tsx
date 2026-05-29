import Link from "next/link";
import { notFound } from "next/navigation";
import {
  EMAIL_PREF_LABELS,
  globalUnsubscribe,
  getEmailPreferences,
} from "@/lib/email/preferences";
import { prisma } from "@/lib/prisma";
import { UnsubscribeActions } from "@/components/email/unsubscribe-actions";

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ confirm?: string }>;
};

export const metadata = {
  title: "Email Preferences | IChing Oracle",
  robots: { index: false, follow: false },
};

async function getUserByToken(token: string) {
  return prisma.user.findFirst({
    where: { emailUnsubscribeToken: token },
    select: { id: true, email: true, name: true },
  });
}

export default async function UnsubscribePage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const { confirm } = await searchParams;

  const user = await getUserByToken(token);
  if (!user) notFound();

  if (confirm === "all") {
    await globalUnsubscribe(token);
  }

  const prefs = await getEmailPreferences(user.id);

  return (
    <div className="relative mx-auto flex min-h-[70vh] w-full max-w-lg flex-col justify-center px-6 py-16">
      <div className="rounded-2xl border border-white/10 bg-zen-surface/80 p-8 backdrop-blur-xl">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-cosmic-violet">
          Email preferences
        </p>
        <h1 className="mt-3 font-serif text-2xl text-foreground">
          {confirm === "all" ? "You are unsubscribed" : "Manage your emails"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zen-muted">
          {confirm === "all"
            ? "You will no longer receive optional emails from the oracle. Account and billing messages may still arrive when necessary."
            : "Choose what feels right. The oracle speaks gently — only when invited."}
        </p>

        {confirm !== "all" ? (
          <UnsubscribeActions
            token={token}
            initialPreferences={{
              emailDailyGuidance: prefs.emailDailyGuidance,
              emailWeeklyReflection: prefs.emailWeeklyReflection,
              emailReengagement: prefs.emailReengagement,
              emailProductUpdates: prefs.emailProductUpdates,
              emailMarketing: prefs.emailMarketing,
            }}
            labels={EMAIL_PREF_LABELS}
          />
        ) : (
          <div className="mt-8 space-y-3">
            <Link href="/settings/notifications" className="auth-btn-primary block text-center">
              Manage preferences
            </Link>
            <Link
              href="/"
              className="block text-center text-sm text-zen-muted hover:text-amber-gold"
            >
              Return home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
