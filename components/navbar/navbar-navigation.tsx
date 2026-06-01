"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { LanguageSelector } from "@/components/language-selector";
import { NavLink } from "@/components/navbar/nav-link";
import {
  MORE_NAV,
  PRIMARY_NAV,
  filterNavItems,
} from "@/components/navbar/nav-items";
import type { SupportedLanguageCode } from "@/lib/i18n/languages";

type NavGroupsProps = {
  isLoggedIn: boolean;
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Centered primary links + More dropdown (desktop). */
export function NavbarDesktopNav({ isLoggedIn }: NavGroupsProps) {
  const pathname = usePathname();
  const moreMenuId = useId();
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const morePanelRef = useRef<HTMLDivElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryItems = filterNavItems(PRIMARY_NAV, isLoggedIn);
  const moreItems = filterNavItems(MORE_NAV, isLoggedIn);

  const closeMore = useCallback(() => setMoreOpen(false), []);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        morePanelRef.current?.contains(target) ||
        moreButtonRef.current?.contains(target)
      ) {
        return;
      }
      closeMore();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMore();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen, closeMore]);

  return (
    <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex">
      <ul className="flex items-center gap-0.5" role="list">
        {primaryItems.map((item) => (
          <li key={item.href}>
            <NavLink item={item} pathname={pathname} />
          </li>
        ))}
      </ul>

      {moreItems.length > 0 ? (
        <div className="relative ml-1.5 border-l border-white/[0.06] pl-2">
          <button
            ref={moreButtonRef}
            type="button"
            id={`${moreMenuId}-button`}
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            aria-controls={`${moreMenuId}-menu`}
            onClick={() => setMoreOpen((open) => !open)}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold/50 ${
              moreOpen ? "text-amber-gold" : "text-zen-muted/90 hover:text-amber-gold"
            }`}
          >
            More
            <Chevron open={moreOpen} />
          </button>

          <AnimatePresence>
            {moreOpen ? (
              <motion.div
                ref={morePanelRef}
                id={`${moreMenuId}-menu`}
                role="menu"
                aria-labelledby={`${moreMenuId}-button`}
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-[11rem] rounded-xl border border-white/[0.08] bg-zen-surface/95 p-1.5 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.65)] backdrop-blur-xl"
              >
                <ul className="space-y-0.5" role="none">
                  {moreItems.map((item) => (
                    <li key={item.href} role="none">
                      <NavLink
                        item={item}
                        pathname={pathname}
                        variant="menu"
                        onNavigate={closeMore}
                      />
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

type NavbarMobileMenuProps = NavGroupsProps & {
  signOutAction: () => Promise<void>;
  preferredLanguage: SupportedLanguageCode | null;
};

/** Hamburger + slide-over panel (mobile / tablet). */
export function NavbarMobileMenu({
  isLoggedIn,
  signOutAction,
  preferredLanguage,
}: NavbarMobileMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const primaryItems = filterNavItems(PRIMARY_NAV, isLoggedIn);
  const moreItems = filterNavItems(MORE_NAV, isLoggedIn);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-zen-surface/40 text-zen-muted transition-colors duration-200 hover:border-amber-gold/30 hover:text-amber-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold/50 lg:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
              onClick={close}
            />
            <motion.aside
              id="mobile-nav-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[min(100vw-3rem,20rem)] flex-col border-l border-white/[0.08] bg-zen-bg/95 shadow-2xl backdrop-blur-xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-zen-muted">
                  Navigate
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zen-muted transition-colors hover:bg-white/[0.05] hover:text-amber-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold/50"
                >
                  <span className="sr-only">Close</span>
                  <CloseIcon />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-5">
                <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.22em] text-zen-muted/80">
                  Main
                </p>
                <ul className="space-y-0.5" role="list">
                  {primaryItems.map((item) => (
                    <li key={item.href}>
                      <NavLink
                        item={item}
                        pathname={pathname}
                        variant="menu"
                        onNavigate={close}
                      />
                    </li>
                  ))}
                </ul>

                {moreItems.length > 0 ? (
                  <>
                    <p className="mb-2 mt-6 px-3 text-[10px] font-medium uppercase tracking-[0.22em] text-zen-muted/80">
                      More
                    </p>
                    <ul className="space-y-0.5" role="list">
                      {moreItems.map((item) => (
                        <li key={item.href}>
                          <NavLink
                            item={item}
                            pathname={pathname}
                            variant="menu"
                            onNavigate={close}
                          />
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </nav>

              <div className="border-t border-white/[0.06] px-4 py-4">
                {isLoggedIn ? (
                  <div className="space-y-3">
                    {preferredLanguage ? (
                      <LanguageSelector currentLanguage={preferredLanguage} />
                    ) : null}
                    <Link
                      href="/dashboard"
                      onClick={close}
                      className="block w-full rounded-lg px-3 py-2.5 text-center text-sm font-medium text-foreground/85 transition-colors hover:bg-white/[0.05] hover:text-amber-gold"
                    >
                      Dashboard
                    </Link>
                    <form action={signOutAction}>
                      <button
                        type="submit"
                        className="w-full rounded-lg border border-white/10 px-3 py-2.5 text-sm font-medium text-zen-muted transition-colors hover:border-amber-gold/30 hover:text-amber-gold"
                      >
                        Sign out
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={close}
                      className="block w-full rounded-lg border border-white/10 px-3 py-2.5 text-center text-sm font-medium text-foreground/90 transition-colors hover:border-amber-gold/30 hover:text-amber-gold"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={close}
                      className="auth-btn-primary block w-full text-center text-sm"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
