export type MobileTabId =
  | "oracle"
  | "daily"
  | "insights"
  | "history"
  | "profile";

export type MobileTab = {
  id: MobileTabId;
  label: string;
  href: string;
  /** Path prefixes that mark this tab active */
  matchPrefixes: string[];
};

export const MOBILE_TABS: MobileTab[] = [
  {
    id: "oracle",
    label: "Oracle",
    href: "/oracle/chat",
    matchPrefixes: ["/oracle", "/reading/guided", "/reading/new"],
  },
  {
    id: "daily",
    label: "Daily",
    href: "/daily",
    matchPrefixes: ["/daily"],
  },
  {
    id: "insights",
    label: "Insights",
    href: "/insights",
    matchPrefixes: ["/insights"],
  },
  {
    id: "history",
    label: "History",
    href: "/history",
    matchPrefixes: ["/history", "/readings"],
  },
  {
    id: "profile",
    label: "Profile",
    href: "/dashboard",
    matchPrefixes: [
      "/dashboard",
      "/beta/profile",
      "/settings",
      "/billing",
      "/account",
    ],
  },
];

/** Routes where bottom nav is hidden (auth, marketing, admin). */
export const MOBILE_NAV_HIDDEN_PREFIXES = [
  "/login",
  "/register",
  "/admin",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/payment",
  "/success",
  "/contact",
  "/privacy",
  "/terms",
  "/impressum",
  "/cookies",
] as const;

export function isMobileTabActive(pathname: string, tab: MobileTab): boolean {
  return tab.matchPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function shouldShowMobileNav(
  pathname: string,
  isLoggedIn: boolean,
): boolean {
  if (!isLoggedIn) return false;
  if (pathname === "/") return false;
  return !MOBILE_NAV_HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
