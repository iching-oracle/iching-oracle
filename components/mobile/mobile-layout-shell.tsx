"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import type { ReactNode } from "react";
import { shouldShowMobileNav } from "@/lib/mobile/nav-tabs";
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav";

type MobileLayoutShellProps = {
  children: ReactNode;
  footer: ReactNode;
};

export function MobileLayoutShell({ children, footer }: MobileLayoutShellProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && Boolean(session?.user?.id);
  const showNav = shouldShowMobileNav(pathname, isLoggedIn);

  return (
    <>
      <div
        className={showNav ? "mobile-main-with-nav" : "flex min-h-0 flex-1 flex-col"}
        data-mobile-nav={showNav ? "true" : undefined}
      >
        {children}
      </div>
      {showNav ? <MobileBottomNav /> : null}
      <div className={showNav ? "hidden md:block" : undefined}>{footer}</div>
    </>
  );
}
