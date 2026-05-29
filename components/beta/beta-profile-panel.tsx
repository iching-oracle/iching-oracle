"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BetaMemberBadge } from "@/components/beta/beta-member-badge";
import { FounderAnnouncements } from "@/components/beta/founder-announcements";
import type { BetaProfileDTO } from "@/types/beta";

export function BetaProfilePanel() {
  const [profile, setProfile] = useState<BetaProfileDTO | null>(null);

  useEffect(() => {
    void fetch("/api/beta/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setProfile(data as BetaProfileDTO | null))
      .catch(() => null);
  }, []);

  if (!profile?.isBetaMember) return null;

  const joined = profile.betaJoinedAt
    ? new Date(profile.betaJoinedAt).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-cosmic-violet/25 bg-gradient-to-br from-cosmic-purple/10 to-zen-surface/80 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <BetaMemberBadge />
          {joined ? (
            <span className="text-xs text-zen-muted">Joined {joined}</span>
          ) : null}
        </div>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-zen-muted">
          You are an early explorer — helping us learn what a thoughtful AI
          oracle can become. Your readings and feedback shape the path forward.
        </p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-widest text-zen-muted">
              Readings
            </dt>
            <dd className="mt-1 font-serif text-2xl text-foreground">
              {profile.totalReadings}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-zen-muted">
              Streak
            </dt>
            <dd className="mt-1 font-serif text-2xl text-foreground">
              {profile.dailyStreak}d
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-zen-muted">
              Feedback
            </dt>
            <dd className="mt-1 font-serif text-2xl text-foreground">
              {profile.feedbackCount}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zen-surface/60 p-6 sm:p-8">
        <h2 className="font-serif text-xl text-foreground">Help shape the product</h2>
        <p className="mt-2 text-sm text-zen-muted">
          Use the feedback buttons on any page, or share a reading reflection after
          each consultation.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-foreground/85">
          <li>✦ Report confusion — we watch for drop-offs</li>
          <li>✦ Request features — ranked by beta community</li>
          <li>✦ Rate resonance — deeply, somewhat, or not really</li>
        </ul>
        <p className="mt-4 rounded-lg border border-amber-gold/20 bg-amber-gold/5 px-4 py-3 text-sm text-amber-gold/90">
          Beta explorers receive generous credits — explore freely, no pressure to
          upgrade during the beta.
        </p>
      </section>

      <FounderAnnouncements />

      <section className="rounded-2xl border border-white/10 bg-zen-surface/40 p-6">
        <h2 className="text-xs uppercase tracking-widest text-zen-muted">
          Roadmap preview
        </h2>
        <ul className="mt-4 space-y-3 text-sm text-zen-muted">
          <li>◦ Deeper pattern insights across readings</li>
          <li>◦ Richer daily oracle personalization</li>
          <li>◦ Companion memory refinements</li>
        </ul>
        <Link
          href="/reading/guided"
          className="auth-btn-primary mt-6 inline-block"
        >
          Continue your journey
        </Link>
      </section>
    </div>
  );
}
