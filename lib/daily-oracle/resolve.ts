import "server-only";

import { cookies } from "next/headers";
import { auth } from "@/auth";
import {
  getOrCreateDailyOracleForUser,
  getOrCreateDailyOracleForVisitor,
} from "@/lib/daily-oracle/service";
import { resolveValidUserId } from "@/lib/daily-oracle/identity";
import {
  touchUserActivity,
} from "@/lib/email/preferences";
import {
  VISITOR_COOKIE_NAME,
} from "@/lib/daily-oracle/visitor";
import type { DailyOraclePayload } from "@/types/daily-oracle";

export async function resolveDailyOracleForPage(): Promise<{
  oracle: DailyOraclePayload;
}> {
  const session = await auth();
  const userId = await resolveValidUserId(session?.user?.id);

  if (userId) {
    const oracle = await getOrCreateDailyOracleForUser(userId);
    void touchUserActivity(userId);
    return { oracle };
  }

  const cookieStore = await cookies();
  const visitorKey = cookieStore.get(VISITOR_COOKIE_NAME)?.value?.trim();

  if (!visitorKey) {
    throw new Error("Visitor cookie missing after ensure-visitor redirect");
  }

  const oracle = await getOrCreateDailyOracleForVisitor(visitorKey);

  return { oracle };
}
