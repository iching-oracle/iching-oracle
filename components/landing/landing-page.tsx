import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { HeroSection } from "@/components/landing/hero-section";
import { ExampleReadingSection } from "@/components/landing/example-reading-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { TrustSection } from "@/components/landing/trust-section";
import { PremiumSection } from "@/components/landing/premium-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { LandingAmbientBackground } from "@/components/landing/ambient-background";
import { LandingSectionDivider } from "@/components/landing/landing-section-divider";
import { getHexagram } from "@/lib/hexagrams";
import { EXAMPLE_READING } from "@/lib/landing/content";
import { formatReadingCount } from "@/lib/landing/stats";

const TestimonialsSection = dynamic(
  () =>
    import("@/components/landing/testimonials-section").then(
      (m) => m.TestimonialsSection,
    ),
  { loading: () => null },
);

type LandingPageProps = {
  isLoggedIn: boolean;
  dailyOracleSlot: ReactNode;
  totalReadings?: number;
};

export function LandingPage({
  isLoggedIn,
  dailyOracleSlot,
  totalReadings,
}: LandingPageProps) {
  const exampleHexagram = getHexagram(EXAMPLE_READING.hexagramNumber);
  const formattedReadingCount =
    typeof totalReadings === "number"
      ? formatReadingCount(totalReadings)
      : undefined;

  return (
    <div className="landing-page relative flex min-h-full flex-col overflow-hidden bg-zen-bg">
      <LandingAmbientBackground />

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pb-20 sm:px-8 sm:pb-28 lg:px-12">
        <HeroSection isLoggedIn={isLoggedIn} />
        <LandingSectionDivider />
        <ExampleReadingSection
          isLoggedIn={isLoggedIn}
          hexagramTitle={exampleHexagram.title}
          hexagramChinese={exampleHexagram.chineseName}
          hexagramJudgment={exampleHexagram.judgment}
        />
        <LandingSectionDivider />
        <HowItWorksSection />
        <LandingSectionDivider />
        <TrustSection
          totalReadings={totalReadings}
          formattedReadingCount={formattedReadingCount}
        />
        <LandingSectionDivider />
        <div className="landing-section py-10 sm:py-16 md:py-20">
          {dailyOracleSlot}
        </div>
        <LandingSectionDivider />
        <PremiumSection isLoggedIn={isLoggedIn} />
        <LandingSectionDivider />
        <FaqSection />
        <LandingSectionDivider />
        <TestimonialsSection />
        <LandingSectionDivider />
        <FinalCtaSection isLoggedIn={isLoggedIn} />
      </main>
    </div>
  );
}
