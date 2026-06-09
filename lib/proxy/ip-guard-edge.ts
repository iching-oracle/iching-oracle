import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Edge-safe IP block check via Upstash REST (no Prisma). */

function getIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  return "unknown";
}

export async function edgeIpGuard(
  request: NextRequest,
): Promise<NextResponse | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;

  const ip = getIp(request);
  const key = `abuse:block:${ip}`;

  try {
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: number | string | null };
    const until = Number(data.result);
    if (!until || Date.now() >= until) return null;

    const retryAfterSec = Math.max(
      1,
      Math.ceil((until - Date.now()) / 1000),
    );
    return NextResponse.json(
      {
        error: "Too many requests. Please pause and try again shortly.",
        code: "RATE_LIMITED",
        retryAfterSec,
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec) },
      },
    );
  } catch {
    return null;
  }
}
