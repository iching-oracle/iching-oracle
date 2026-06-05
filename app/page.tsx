import { auth } from "@/auth";
import { DailyOraclePreview } from "@/app/components/home/DailyOraclePreview";
import { LandingPage } from "@/components/landing/landing-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "I Ching Oracle — A Quiet Space for Reflection",
  description:
    "Ancient wisdom, interpreted thoughtfully. Personalized I Ching readings for calm self-reflection—private, unhurried, and emotionally intelligent.",
  path: "/",
  keywords: [
    "i ching",
    "iching oracle",
    "ai divination",
    "hexagram reading",
    "spiritual guidance",
  ],
});

export default async function Home() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user?.id);

  return (
    <LandingPage
      isLoggedIn={isLoggedIn}
      dailyOracleSlot={
        <div className="py-4 sm:py-8">
          <DailyOraclePreview />
        </div>
      }
    />
  );
}
