import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import {
  visitorCookieOptions,
} from "@/lib/daily-oracle/visitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Sets the anonymous visitor cookie, then redirects back to /daily. */
export async function GET(request: Request) {
  const visitorKey = randomBytes(16).toString("hex");
  const redirectTo = new URL("/daily", request.url);
  const response = NextResponse.redirect(redirectTo);
  response.cookies.set(visitorCookieOptions(visitorKey));
  return response;
}
