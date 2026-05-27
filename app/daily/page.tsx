import { cookies } from "next/headers";
import { DailyOracleExperience } from "@/components/daily/DailyOracleExperience";
import { resolveDailyOracleForPage } from "@/lib/daily-oracle/resolve";
import { formatWeekdayDate } from "@/lib/format-date";

export const metadata = {
  title: "Daily Oracle | ICHING-ORACLE",
  description:
    "Your personal daily hexagram, emotional insight, and reflection for today.",
};

export default async function DailyOraclePage() {
  const { oracle, setVisitorCookie } = await resolveDailyOracleForPage();

  if (setVisitorCookie) {
    const cookieStore = await cookies();
    cookieStore.set(setVisitorCookie);
  }

  const dateLabel = formatWeekdayDate(`${oracle.date}T12:00:00Z`, "en-US");

  return <DailyOracleExperience oracle={oracle} dateLabel={dateLabel} />;
}
