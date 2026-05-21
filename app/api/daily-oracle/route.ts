import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getOrCreateDailyOracleForUser,
  getOrCreateDailyOracleForVisitor,
} from "@/lib/daily-oracle/service";
import {
  VISITOR_COOKIE_NAME,
  visitorCookieOptions,
} from "@/lib/daily-oracle/visitor";

export async function GET() {
  try {
    const session = await auth();

    if (session?.user?.id) {
      const oracle = await getOrCreateDailyOracleForUser(session.user.id);
      return NextResponse.json({ oracle });
    }

    const cookieStore = await cookies();
    let visitorKey = cookieStore.get(VISITOR_COOKIE_NAME)?.value?.trim();
    const shouldSetCookie = !visitorKey;

    if (!visitorKey) {
      visitorKey = randomBytes(16).toString("hex");
    }

    const oracle = await getOrCreateDailyOracleForVisitor(visitorKey);
    const response = NextResponse.json({ oracle });

    if (shouldSetCookie) {
      response.cookies.set(visitorCookieOptions(visitorKey));
    }

    return response;
  } catch (error) {
    console.error("[api/daily-oracle GET]", error);
    return NextResponse.json(
      { error: "Failed to load daily oracle" },
      { status: 500 },
    );
  }
}

export async function POST() {
  return GET();
}
