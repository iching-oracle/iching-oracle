import "server-only";

/** Vercel / Node runtime environment label for Sentry & logs. */
export function getMonitoringEnvironment(): string {
  const vercel = process.env.VERCEL_ENV?.trim();
  if (vercel === "production" || vercel === "preview" || vercel === "development") {
    return vercel;
  }
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

export function isProductionMonitoring(): boolean {
  return getMonitoringEnvironment() === "production";
}
