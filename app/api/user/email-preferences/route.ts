import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  getEmailPreferences,
  updateEmailPreferences,
  type EmailPreferenceKey,
} from "@/lib/email/preferences";
import { prisma } from "@/lib/prisma";

const patchSchema = z
  .object({
    emailDailyGuidance: z.boolean().optional(),
    emailWeeklyReflection: z.boolean().optional(),
    emailReengagement: z.boolean().optional(),
    emailProductUpdates: z.boolean().optional(),
    emailMarketing: z.boolean().optional(),
    globalUnsubscribe: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field required",
  });

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prefs = await getEmailPreferences(session.user.id);
  return NextResponse.json({
    emailDailyGuidance: prefs.emailDailyGuidance,
    emailWeeklyReflection: prefs.emailWeeklyReflection,
    emailReengagement: prefs.emailReengagement,
    emailProductUpdates: prefs.emailProductUpdates,
    emailMarketing: prefs.emailMarketing,
    globallyUnsubscribed: prefs.globallyUnsubscribed,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { globalUnsubscribe, ...prefs } = parsed.data;

  if (globalUnsubscribe) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailGlobalUnsubscribedAt: new Date(),
        emailDailyGuidance: false,
        emailWeeklyReflection: false,
        emailReengagement: false,
        emailProductUpdates: false,
        emailMarketing: false,
      },
    });
  } else {
    const updates: Partial<Record<EmailPreferenceKey, boolean>> = {};
    for (const key of [
      "emailDailyGuidance",
      "emailWeeklyReflection",
      "emailReengagement",
      "emailProductUpdates",
      "emailMarketing",
    ] as const) {
      if (typeof prefs[key] === "boolean") {
        updates[key] = prefs[key];
      }
    }
    if (Object.keys(updates).length > 0) {
      await updateEmailPreferences(session.user.id, updates);
    }
  }

  const next = await getEmailPreferences(session.user.id);
  return NextResponse.json({
    emailDailyGuidance: next.emailDailyGuidance,
    emailWeeklyReflection: next.emailWeeklyReflection,
    emailReengagement: next.emailReengagement,
    emailProductUpdates: next.emailProductUpdates,
    emailMarketing: next.emailMarketing,
    globallyUnsubscribed: next.globallyUnsubscribed,
  });
}
