"use server";

import { auth, signOut } from "@/auth";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server";

export async function handleSignOut() {
  const session = await auth();
  if (session?.user?.id) {
    await trackServerEvent(ANALYTICS_EVENTS.USER_LOGGED_OUT, {
      userId: session.user.id,
    });
  }
  await signOut({ redirectTo: "/" });
}
