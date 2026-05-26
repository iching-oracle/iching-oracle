import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getInsightsPagePayload } from "@/lib/insights/service";
import { localeForLanguage } from "@/lib/i18n/languages";
import { getPreferredLanguageForUser } from "@/lib/user/preferred-language";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const language = await getPreferredLanguageForUser(session.user.id);
    const locale = localeForLanguage(language);

    const payload = await getInsightsPagePayload(session.user.id, locale);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[api/insights]", error);
    return NextResponse.json(
      { error: "Unable to load pattern insights." },
      { status: 500 },
    );
  }
}
