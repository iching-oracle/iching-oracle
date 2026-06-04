import { auth } from "@/auth";
import { DailyOraclePreview } from "@/app/components/home/DailyOraclePreview";
import { LandingPage } from "@/components/landing/landing-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "AI I Ching Oracle — Ancient Wisdom, Modern Insight",
  description:
    "Premium AI-powered I Ching readings for self-reflection and guidance. Ask your question, receive your hexagram, and explore personalized interpretation.",
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
