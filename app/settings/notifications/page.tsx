import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { EmailPreferencesPanel } from "@/components/email/email-preferences-panel";
import { WeeklyOracleSettings } from "@/components/email/weekly-oracle-settings";
import { getEmailPreferences } from "@/lib/email/preferences";

export const metadata = {
  title: "Email Notifications | IChing Oracle",
  description: "Manage your email preferences for daily guidance and reflections.",
};

export default async function NotificationsSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/settings/notifications");
  }

  const prefs = await getEmailPreferences(session.user.id);

  return (
    <div className="relative mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 sm:py-16">
      <div
        className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-amber-gold/10 blur-[100px]"
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
          <h1 className="mt-4 font-serif text-3xl text-foreground">
            Email notifications
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zen-muted">
            Choose how the oracle reaches you — calm, thoughtful messages, never
            noise.
          </p>
        </div>

        <WeeklyOracleSettings initialEnabled={prefs.weeklyOracleEnabled} />

        <EmailPreferencesPanel
          initialPreferences={{
            emailDailyGuidance: prefs.emailDailyGuidance,
            emailWeeklyReflection: prefs.emailWeeklyReflection,
            emailReengagement: prefs.emailReengagement,
            emailProductUpdates: prefs.emailProductUpdates,
            emailMarketing: prefs.emailMarketing,
            globallyUnsubscribed: prefs.globallyUnsubscribed,
          }}
        />
      </div>
    </div>
  );
}
