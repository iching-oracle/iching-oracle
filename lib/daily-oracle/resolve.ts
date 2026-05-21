import "server-only";

import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import {
  getOrCreateDailyOracleForUser,
  getOrCreateDailyOracleForVisitor,
} from "@/lib/daily-oracle/service";
import {
  VISITOR_COOKIE_NAME,
  visitorCookieOptions,
} from "@/lib/daily-oracle/visitor";
import type { DailyOraclePayload } from "@/types/daily-oracle";

export async function resolveDailyOracleForPage(): Promise<{
  oracle: DailyOraclePayload;
  setVisitorCookie?: ReturnType<typeof visitorCookieOptions>;
}> {
  const session = await auth();

  if (session?.user?.id) {
    const oracle = await getOrCreateDailyOracleForUser(session.user.id);
    return { oracle };
  }

  const cookieStore = await cookies();
  let visitorKey = cookieStore.get(VISITOR_COOKIE_NAME)?.value?.trim();
  const shouldSetCookie = !visitorKey;

  if (!visitorKey) {
    visitorKey = randomBytes(16).toString("hex");
  }

  const oracle = await getOrCreateDailyOracleForVisitor(visitorKey);

  if (shouldSetCookie) {
    return {
      oracle,
      setVisitorCookie: visitorCookieOptions(visitorKey),
    };
  }

  return { oracle };
}
