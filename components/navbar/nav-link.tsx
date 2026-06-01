"use client";

import Link from "next/link";
import type { NavItem } from "@/components/navbar/nav-items";
import { isNavItemActive } from "@/components/navbar/nav-items";

const baseClass =
  "relative rounded-md px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zen-bg";

const inactiveClass =
  "text-zen-muted/90 hover:bg-white/[0.04] hover:text-amber-gold";

const activeClass =
  "text-amber-gold after:absolute after:inset-x-2 after:-bottom-0.5 after:h-px after:bg-gradient-to-r after:from-transparent after:via-amber-gold/70 after:to-transparent";

type NavLinkProps = {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
  className?: string;
  variant?: "inline" | "menu";
};

export function NavLink({
  item,
  pathname,
  onNavigate,
  className = "",
  variant = "inline",
}: NavLinkProps) {
  const active = isNavItemActive(pathname, item.href);
  const menuClass =
    variant === "menu"
      ? "block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium tracking-wide"
      : baseClass;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`${menuClass} ${
        active
          ? variant === "menu"
            ? "bg-amber-gold/10 text-amber-gold"
            : activeClass
          : variant === "menu"
            ? "text-foreground/85 hover:bg-white/[0.05] hover:text-amber-gold"
            : inactiveClass
      } ${className}`}
    >
      {item.label}
    </Link>
  );
}
