"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { ConsentProvider } from "@/components/trust/consent-provider";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { BetaChrome } from "@/components/beta/beta-chrome";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ConsentProvider>
        <AnalyticsProvider>
          <ToastProvider />
          <div className="flex min-h-full flex-1 flex-col">{children}</div>
          <BetaChrome />
          <SiteFooter />
        </AnalyticsProvider>
      </ConsentProvider>
    </SessionProvider>
  );
}
