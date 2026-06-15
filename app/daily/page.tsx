import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DailyOracleExperience } from "@/components/daily/DailyOracleExperience";
import { resolveValidUserId } from "@/lib/daily-oracle/identity";
import { resolveDailyOracleForPage } from "@/lib/daily-oracle/resolve";
import { VISITOR_COOKIE_NAME } from "@/lib/daily-oracle/visitor";
import { formatWeekdayDate } from "@/lib/format-date";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Daily Oracle — Today's Hexagram",
  description:
    "Receive your personal daily hexagram, emotional insight, and reflection from the I Ching.",
  path: "/daily",
  keywords: ["daily i ching", "daily hexagram", "daily oracle"],
});

export default async function DailyOraclePage() {
  const session = await auth();
  const userId = await resolveValidUserId(session?.user?.id);

  if (!userId) {
    const cookieStore = await cookies();
    if (!cookieStore.get(VISITOR_COOKIE_NAME)?.value?.trim()) {
      redirect("/api/daily-oracle/ensure-visitor");
    }
  }

  const { oracle } = await resolveDailyOracleForPage();

  const dateLabel = formatWeekdayDate(`${oracle.date}T12:00:00Z`, "en-US");

  return <DailyOracleExperience oracle={oracle} dateLabel={dateLabel} />;
}
