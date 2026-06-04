import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type MobilePageProps = {
  children: ReactNode;
  className?: string;
  /** Narrow reading column on mobile */
  reading?: boolean;
  focus?: boolean;
};

/**
 * Standard mobile-first page rhythm: generous padding, max-width, safe areas.
 */
export function MobilePage({
  children,
  className,
  reading = false,
  focus = false,
}: MobilePageProps) {
  return (
    <div
      className={cn(
        "mobile-page",
        reading && "mobile-page--reading",
        focus && "mobile-page--focus",
        className,
      )}
    >
      {children}
    </div>
  );
}
