import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DailyOracleExperience } from "@/components/daily/DailyOracleExperience";
import { resolveValidUserId } from "@/lib/daily-oracle/identity";
import { resolveDailyOracleForPage } from "@/lib/daily-oracle/resolve";
import { VISITOR_COOKIE_NAME } from "@/lib/daily-oracle/visitor";
import { formatWeekdayDate } from "@/lib/format-date";

export const metadata = {
  title: "Daily Oracle | ICHING-ORACLE",
  description:
    "Your personal daily hexagram, emotional insight, and reflection for today.",
};

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
