import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/email/client";
import { recordEmailClick } from "@/lib/email/tracking";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("uid")?.trim();
  const type = searchParams.get("type")?.trim();

  let destination = `${getAppUrl()}/dashboard`;

  if (userId && type) {
    const resolved = await recordEmailClick(userId, type);
    if (resolved) destination = `${getAppUrl()}${resolved}`;
  }

  return NextResponse.redirect(destination, 302);
}
