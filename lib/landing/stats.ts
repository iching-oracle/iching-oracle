import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const getPublicReadingStats = unstable_cache(
  async () => {
    const totalReadings = await prisma.reading.count();
    return { totalReadings };
  },
  ["landing-public-reading-stats"],
  { revalidate: 3600 },
);

export function formatReadingCount(count: number): string {
  if (count < 100) return count.toLocaleString();
  if (count < 10_000) return count.toLocaleString();
  if (count < 1_000_000) {
    const k = count / 1000;
    return k >= 100 ? `${Math.round(k)}k+` : `${k.toFixed(1).replace(/\.0$/, "")}k+`;
  }
  return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M+`;
}
