"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export const ANALYTICS_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "readings", label: "Readings" },
  { id: "revenue", label: "Revenue" },
  { id: "users", label: "Users" },
  { id: "retention", label: "Retention" },
  { id: "errors", label: "Errors" },
] as const;

export type AnalyticsSectionId = (typeof ANALYTICS_SECTIONS)[number]["id"];

type DashboardSidebarProps = {
  activeSection: AnalyticsSectionId;
  onNavigate: (id: AnalyticsSectionId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function DashboardSidebar({
  activeSection,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}: DashboardSidebarProps) {
  const nav = (
    <nav className="flex flex-col gap-1 p-4" aria-label="Analytics sections">
      {ANALYTICS_SECTIONS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            onNavigate(item.id);
            onCloseMobile();
          }}
          className={`rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
            activeSection === item.id
              ? "bg-amber-gold/15 text-amber-gold"
              : "text-zen-muted hover:bg-white/5 hover:text-foreground"
          }`}
        >
          {item.label}
        </button>
      ))}
      <div className="my-4 border-t border-white/10" />
      <Link
        href="/admin"
        className="rounded-lg px-3 py-2 text-sm text-zen-muted hover:bg-white/5 hover:text-foreground"
      >
        ← Admin home
      </Link>
    </nav>
  );

  return (
    <>
      <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-zen-surface/40 backdrop-blur-xl lg:block">
        <div className="sticky top-0 p-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold">
            Analytics
          </p>
          <p className="mt-1 text-xs text-zen-muted">Product intelligence</p>
        </div>
        {nav}
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              aria-label="Close menu"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-zen-bg lg:hidden"
            >
              <div className="p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold">
                  Analytics
                </p>
              </div>
              {nav}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
