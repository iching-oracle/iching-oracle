import { cookies } from "next/headers";
import { randomBytes } from "crypto";

export const VISITOR_COOKIE_NAME = "iching_visitor_id";

export async function getOrCreateVisitorKey(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(VISITOR_COOKIE_NAME)?.value?.trim();
  if (existing) return existing;

  return randomBytes(16).toString("hex");
}

export function visitorCookieOptions(value: string) {
  return {
    name: VISITOR_COOKIE_NAME,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  };
}
