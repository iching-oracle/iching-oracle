import type { ReactNode } from "react";
import { HeroSection } from "@/components/landing/hero-section";
import { TrustSection } from "@/components/landing/trust-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { MethodsSection } from "@/components/landing/methods-section";
import { PremiumSection } from "@/components/landing/premium-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { WaitlistSection } from "@/components/landing/waitlist-section";
import { LandingAmbientBackground } from "@/components/landing/ambient-background";
import { LandingSectionDivider } from "@/components/landing/landing-section-divider";

type LandingPageProps = {
  isLoggedIn: boolean;
  dailyOracleSlot: ReactNode;
};

export function LandingPage({ isLoggedIn, dailyOracleSlot }: LandingPageProps) {
  return (
    <div className="landing-page relative flex min-h-full flex-col overflow-hidden bg-zen-bg">
      <LandingAmbientBackground />

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-5 pb-24 sm:px-8 sm:pb-28 lg:px-12">
        <HeroSection isLoggedIn={isLoggedIn} />
        <LandingSectionDivider />
        <TrustSection />
        <LandingSectionDivider />
        <HowItWorksSection />
        <div className="landing-section py-12 sm:py-16 md:py-20">{dailyOracleSlot}</div>
        <LandingSectionDivider />
        <MethodsSection />
        <LandingSectionDivider />
        <PremiumSection isLoggedIn={isLoggedIn} />
        <LandingSectionDivider />
        <WaitlistSection />
        <LandingSectionDivider />
        <TestimonialsSection />
        <LandingSectionDivider />
        <FinalCtaSection isLoggedIn={isLoggedIn} />
      </main>
    </div>
  );
}
