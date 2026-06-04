"use client";

import Link from "next/link";
import { WaitlistForm } from "@/components/trust/waitlist-form";
import { useConsent } from "@/components/trust/consent-provider";

export function SiteFooter() {
  const { openPreferences } = useConsent();

  return (
    <footer className="mt-auto border-t border-white/10 bg-zen-surface/30 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold">
              Early access
            </p>
            <p className="mt-2 font-serif text-lg text-foreground">
              Join the circle
            </p>
            <p className="mt-1 text-sm text-zen-muted">
              Be first to hear when new rituals and features arrive.
            </p>
            <WaitlistForm source="footer" className="mt-4" />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zen-muted">
              Explore
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/hexagrams" className="text-zen-muted hover:text-amber-gold">
                  Hexagrams
                </Link>
              </li>
              <li>
                <Link href="/learn" className="text-zen-muted hover:text-amber-gold">
                  Learn
                </Link>
              </li>
              <li>
                <Link href="/trust/ai" className="text-zen-muted hover:text-amber-gold">
                  How AI works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-zen-muted hover:text-amber-gold">
                  Premium
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zen-muted">
              Trust & legal
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-zen-muted transition-colors hover:text-amber-gold">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-zen-muted transition-colors hover:text-amber-gold">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/impressum" className="text-zen-muted transition-colors hover:text-amber-gold">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-zen-muted transition-colors hover:text-amber-gold">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-zen-muted transition-colors hover:text-amber-gold">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-zen-muted transition-colors hover:text-amber-gold">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-zen-muted transition-colors hover:text-amber-gold">
                  Refunds
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openPreferences}
                  className="text-zen-muted hover:text-amber-gold"
                >
                  Cookie preferences
                </button>
              </li>
              <li>
                <Link href="/support" className="text-zen-muted hover:text-amber-gold">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-zen-muted">
          © {new Date().getFullYear()} I Ching Oracle · For reflection, not certainty.
        </p>
      </div>
    </footer>
  );
}
