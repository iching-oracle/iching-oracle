import { NextResponse } from "next/server";
import { z } from "zod";
import {
  updateEmailPreferences,
  type EmailPreferenceKey,
} from "@/lib/email/preferences";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  emailDailyGuidance: z.boolean().optional(),
  emailWeeklyReflection: z.boolean().optional(),
  emailReengagement: z.boolean().optional(),
  emailProductUpdates: z.boolean().optional(),
  emailMarketing: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ token: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const user = await prisma.user.findFirst({
    where: { emailUnsubscribeToken: token },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const updates: Partial<Record<EmailPreferenceKey, boolean>> = {};
  for (const key of [
    "emailDailyGuidance",
    "emailWeeklyReflection",
    "emailReengagement",
    "emailProductUpdates",
    "emailMarketing",
  ] as const) {
    if (typeof parsed.data[key] === "boolean") {
      updates[key] = parsed.data[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates" }, { status: 400 });
  }

  await updateEmailPreferences(user.id, updates);
  return NextResponse.json({ ok: true });
}
