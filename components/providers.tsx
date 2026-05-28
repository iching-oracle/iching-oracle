"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { ConsentProvider } from "@/components/trust/consent-provider";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ConsentProvider>
        <AnalyticsProvider>
          <div className="flex min-h-full flex-1 flex-col">{children}</div>
          <SiteFooter />
        </AnalyticsProvider>
      </ConsentProvider>
    </SessionProvider>
  );
}
