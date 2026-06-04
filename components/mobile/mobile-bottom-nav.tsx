"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { MOBILE_TABS, isMobileTabActive } from "@/lib/mobile/nav-tabs";
import { MobileTabIcon } from "@/components/mobile/mobile-nav-icons";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";

export function MobileBottomNav() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const haptic = useHapticFeedback();

  return (
    <nav
      className="mobile-bottom-nav md:hidden"
      aria-label="Primary"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mobile-bottom-nav__glow" aria-hidden />
      <ul className="mobile-bottom-nav__list" role="list">
        {MOBILE_TABS.map((tab) => {
          const active = isMobileTabActive(pathname, tab);
          return (
            <li key={tab.id} className="flex-1">
              <Link
                href={tab.href}
                onClick={() => haptic("light")}
                className={`mobile-bottom-nav__item tap-feedback ${active ? "mobile-bottom-nav__item--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {active && !reduced ? (
                  <motion.span
                    layoutId="mobile-nav-glow"
                    className="mobile-bottom-nav__active-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    aria-hidden
                  />
                ) : null}
                <MobileTabIcon
                  tabId={tab.id}
                  className={`relative z-10 h-[1.35rem] w-[1.35rem] transition-colors duration-300 ${
                    active ? "text-amber-gold" : "text-zen-muted"
                  }`}
                />
                <span
                  className={`relative z-10 mt-1 text-[10px] font-medium tracking-wide transition-colors duration-300 ${
                    active ? "text-amber-glow" : "text-zen-muted"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
