"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/landing/section-header";
import { BetaWaitlistForm } from "@/components/beta/beta-waitlist-form";

export function WaitlistSection() {
  return (
    <section
      id="beta-waitlist"
      className="py-16 sm:py-24"
      aria-labelledby="waitlist-heading"
    >
      <div className="relative overflow-hidden rounded-3xl border border-amber-gold/15 bg-gradient-to-br from-zen-surface/80 via-cosmic-deep/15 to-zen-bg px-6 py-12 sm:px-10 sm:py-14">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.1),transparent_50%)]"
          aria-hidden
        />
        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <SectionHeader
            id="waitlist-heading"
            eyebrow="Early access"
            title="Join the private beta"
            description="We release invites in small waves to keep the experience intimate. No spam—just a personal note when your spot is ready."
            align="left"
          />
          <div className="lg:pl-4">
            <BetaWaitlistForm source="homepage" />
            <p className="mt-4 text-center text-xs text-zen-muted lg:text-left">
              Have an invite?{" "}
              <Link href="/register" className="text-amber-gold hover:underline">
                Register with your code
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
