"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "@/components/landing/section-header";
import { BetaWaitlistForm } from "@/components/beta/beta-waitlist-form";
import { LANDING_SECTIONS } from "@/lib/landing/content";
import {
  LANDING_VIEWPORT,
  landingInitial,
  landingTransition,
} from "@/lib/landing/motion";

export function WaitlistSection() {
  const reduceMotion = useReducedMotion();
  const copy = LANDING_SECTIONS.waitlist;

  return (
    <section
      id="beta-waitlist"
      className="landing-section"
      aria-labelledby="waitlist-heading"
    >
      <motion.div
        initial={landingInitial(reduceMotion, 14)}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={LANDING_VIEWPORT}
        transition={landingTransition(reduceMotion)}
        className="relative overflow-hidden rounded-3xl border border-amber-gold/12 bg-gradient-to-br from-zen-surface/75 via-cosmic-deep/10 to-zen-bg px-6 py-14 sm:px-12 sm:py-16"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.06),transparent_55%)]"
          aria-hidden
        />
        <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-14">
          <SectionHeader
            id="waitlist-heading"
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
            align="left"
          />
          <div className="lg:pl-2">
            <BetaWaitlistForm source="homepage" />
            <p className="mt-5 text-center text-xs tracking-wide text-zen-muted/80 lg:text-left">
              Have an invite?{" "}
              <Link
                href="/register?mode=invite"
                className="text-amber-gold/90 transition-colors duration-500 hover:text-amber-gold"
              >
                Register with your code
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
