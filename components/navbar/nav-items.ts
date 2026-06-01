export type NavItem = {
  label: string;
  href: string;
  /** Only shown when authenticated */
  authOnly?: boolean;
};

export const PRIMARY_NAV: NavItem[] = [
  { label: "Oracle", href: "/oracle/chat", authOnly: true },
  { label: "Hexagrams", href: "/hexagrams" },
  { label: "Insights", href: "/insights", authOnly: true },
  { label: "Premium", href: "/pricing" },
];

export const MORE_NAV: NavItem[] = [
  { label: "Daily", href: "/daily" },
  { label: "Methods", href: "/#methods" },
  { label: "Learn", href: "/learn" },
  { label: "Emails", href: "/settings/notifications", authOnly: true },
  { label: "Memory", href: "/settings/memory", authOnly: true },
  { label: "History", href: "/history", authOnly: true },
  { label: "Beta", href: "/beta" },
];

export function filterNavItems(items: NavItem[], isLoggedIn: boolean): NavItem[] {
  return items.filter((item) => !item.authOnly || isLoggedIn);
}

/** Match current route for active nav styling (including nested paths). */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/#methods") {
    return pathname === "/";
  }

  const path = href.split("#")[0].split("?")[0];

  if (path === "/pricing") {
    return pathname === "/pricing" || pathname.startsWith("/billing");
  }

  if (path === "/oracle/chat" || path === "/oracle") {
    return pathname.startsWith("/oracle");
  }

  if (path === "/") {
    return pathname === "/";
  }

  return pathname === path || pathname.startsWith(`${path}/`);
}
