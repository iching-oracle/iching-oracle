import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveValidUserId } from "@/lib/auth/session-user";
import { getInsightsPagePayload } from "@/lib/insights/service";
import { localeForLanguage } from "@/lib/i18n/languages";
import { getPreferredLanguageForUser } from "@/lib/user/preferred-language";

export async function GET() {
  const session = await auth();
  const userId = await resolveValidUserId(session?.user?.id);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const language = await getPreferredLanguageForUser(userId);
    const locale = localeForLanguage(language);

    const payload = await getInsightsPagePayload(userId, locale);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[api/insights]", error);
    return NextResponse.json(
      { error: "Unable to load pattern insights." },
      { status: 500 },
    );
  }
}
