import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getBetaProfile } from "@/lib/beta/waitlist";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getBetaProfile(session.user.id);
  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}
