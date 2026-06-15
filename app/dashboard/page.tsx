import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ReadingCard } from "@/components/ReadingCard";
import { HistoryEmptyState } from "@/components/HistoryEmptyState";
import { handleSignOut } from "@/lib/actions/auth";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { PricingCard } from "@/components/PricingCard";
import { getDashboardData } from "@/lib/dashboard/get-dashboard-data";
import { localeForLanguage } from "@/lib/i18n/languages";
import { getRecentReadingHistory } from "@/lib/readings/history";
import { getPreferredLanguageForUser } from "@/lib/user/preferred-language";
import { PremiumBadge } from "@/components/subscription/PremiumBadge";
import { ManageSubscriptionButton } from "@/components/subscription/ManageSubscriptionButton";
import { formatPremiumExpiry, hasPremiumAccess } from "@/lib/premium";
import { ContinueJourneyPrompt } from "@/components/retention/continue-journey-prompt";
import { ReflectionStreakWidget } from "@/components/retention/reflection-streak-widget";
import { ReflectionTimeline } from "@/components/retention/reflection-timeline";
import { MobilePage } from "@/components/mobile/mobile-page";
import { getRetentionDashboardStats } from "@/lib/retention/dashboard-stats";
import {
  FREE_DAILY_READING_LIMIT,
  getUsageLimitsForUser,
} from "@/lib/subscription";

import { buildNoIndexMetadata } from "@/lib/seo/noindex-metadata";

export const metadata = buildNoIndexMetadata({
  title: "Dashboard",
  description: "Your reflective journal and oracle path.",
  path: "/dashboard",
});

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const data = await getDashboardData(session.user.id);

  if (!data) {
    redirect("/login");
  }

  const [recentHistory, preferredLanguage, usage, retention] = await Promise.all([
    getRecentReadingHistory(session.user.id, 3),
    getPreferredLanguageForUser(session.user.id),
    getUsageLimitsForUser(session.user.id),
    getRetentionDashboardStats(session.user.id),
  ]);
  const dateLocale = localeForLanguage(preferredLanguage);

  const { user } = data;
  const displayName = user.name?.trim() || "Seeker";
  const isPremium = hasPremiumAccess(user);
  const premiumExpiry = formatPremiumExpiry(user.premiumUntil);

  return (
    <MobilePage className="relative">
      <div
        className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-cosmic-purple/15 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-amber-gold/10 blur-[90px]"
        aria-hidden
      />

      <div className="relative space-y-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-cosmic-violet">
              Dashboard
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                Welcome, {displayName}
              </h1>
              {isPremium ? <PremiumBadge /> : null}
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Link href="/insights" className="auth-btn-secondary text-center">
              Insights
            </Link>
            <Link href="/beta/profile" className="auth-btn-secondary text-center">
              Beta
            </Link>
            <Link href="/history" className="auth-btn-secondary text-center">
              History
            </Link>
            <Link href="/reading/guided" className="auth-btn-primary text-center">
              Guided Reading
            </Link>
            <Link href="/reading/new" className="auth-btn-secondary text-center">
              Quick Reading
            </Link>
          </div>
        </div>

        <ReflectionStreakWidget
          streak={retention.dailyStreak}
          lastDailyVisit={retention.lastDailyVisit}
        />

        <ContinueJourneyPrompt
          daysSinceLastReading={retention.daysSinceLastReading}
          hasReadings={retention.readingCount > 0}
          readingCount={retention.readingCount}
        />

        <ReflectionTimeline userId={session.user.id} />

        <section className="rounded-2xl border border-white/10 bg-zen-surface/70 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="sr-only">Account</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-widest text-zen-muted">
                Name
              </dt>
              <dd className="mt-1 text-lg text-foreground">{user.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-widest text-zen-muted">
                Email
              </dt>
              <dd className="mt-1 text-lg text-foreground">{user.email}</dd>
            </div>
          </dl>
          {isPremium ? (
            <div className="mt-4 space-y-3">
              <p className="rounded-lg border border-cosmic-violet/30 bg-cosmic-purple/15 px-3 py-2 text-sm text-cosmic-violet">
                Premium active
                {premiumExpiry ? ` until ${premiumExpiry}` : ""}
              </p>
              {user.stripeCustomerId ? (
                <ManageSubscriptionButton />
              ) : null}
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-white/10 bg-zen-elevated/40 px-3 py-2 text-sm text-zen-muted">
              Free plan · {usage.dailyReadingsUsed}/{FREE_DAILY_READING_LIMIT}{" "}
              readings used today
            </p>
          )}
          <form action={handleSignOut} className="mt-6 border-t border-white/10 pt-6">
            <button
              type="submit"
              className="text-sm text-zen-muted transition-colors hover:text-amber-gold"
            >
              Sign out
            </button>
          </form>
        </section>

        {!isPremium ? (
          <section>
            <PricingCard />
          </section>
        ) : null}

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-semibold text-foreground">
                Recent readings
              </h2>
              <p className="mt-1 text-sm text-zen-muted">
                Your latest consultations — saved automatically.
              </p>
            </div>
            <Link
              href="/history"
              className="shrink-0 text-sm font-medium text-amber-gold transition-colors hover:text-amber-glow"
            >
              View full history →
            </Link>
          </div>

          {recentHistory.length === 0 ? (
            <HistoryEmptyState />
          ) : (
            <ul className="space-y-3">
              {recentHistory.map((reading, index) => (
                <ReadingCard
                  key={reading.id}
                  reading={reading}
                  locale={dateLocale}
                  index={index}
                />
              ))}
            </ul>
          )}
        </section>

        <section
          className="rounded-2xl border border-red-500/25 bg-red-950/20 p-6 backdrop-blur-xl sm:p-8"
          aria-labelledby="danger-zone-heading"
        >
          <h2
            id="danger-zone-heading"
            className="font-serif text-xl font-semibold text-red-300"
          >
            Danger Zone
          </h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-zen-muted">
            Permanently delete your account and all associated data.
          </p>
          <div className="mt-5">
            <DeleteAccountButton userEmail={user.email} />
          </div>
        </section>

        <Link
          href="/"
          className="max-md:hidden inline-block text-sm text-zen-muted transition-colors hover:text-amber-gold"
        >
          ← Back to home
        </Link>
      </div>
    </MobilePage>
  );
}
