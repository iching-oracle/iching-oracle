import { auth } from "@/auth";
import { DailyOraclePreview } from "@/app/components/home/DailyOraclePreview";
import { LandingPage } from "@/components/landing/landing-page";
import { LANDING_FAQ } from "@/lib/landing/content";
import { getPublicReadingStats } from "@/lib/landing/stats";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  faqPageSchema,
  JsonLd,
  webApplicationSchema,
} from "@/lib/seo/schema";

export const metadata = buildPageMetadata({
  title: "AI-Powered I Ching Readings in Seconds",
  description:
    "Ask any question and receive personalized I Ching guidance based on all 64 hexagrams. Free readings, AI-enhanced interpretations, private and secure.",
  path: "/",
  keywords: [
    "i ching",
    "iching oracle",
    "ai i ching reading",
    "hexagram reading",
    "i ching online",
    "book of changes",
    "spiritual guidance",
    "career i ching",
    "relationship i ching",
    "ai divination",
  ],
});

export default async function Home() {
  const [session, stats] = await Promise.all([auth(), getPublicReadingStats()]);
  const isLoggedIn = Boolean(session?.user?.id);
  const faqSchema = faqPageSchema([...LANDING_FAQ]);

  return (
    <>
      <JsonLd data={webApplicationSchema()} />
      {faqSchema ? <JsonLd data={faqSchema} /> : null}
      <LandingPage
        isLoggedIn={isLoggedIn}
        totalReadings={stats.totalReadings}
        dailyOracleSlot={
          <div className="py-2 sm:py-6">
            <DailyOraclePreview />
          </div>
        }
      />
    </>
  );
}
