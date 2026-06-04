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

type LandingPageProps = {
  isLoggedIn: boolean;
  dailyOracleSlot: ReactNode;
};

export function LandingPage({ isLoggedIn, dailyOracleSlot }: LandingPageProps) {
  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-zen-bg">
      <LandingAmbientBackground />

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-5 pb-20 sm:px-8 lg:px-12">
        <HeroSection isLoggedIn={isLoggedIn} />
        <TrustSection />
        <HowItWorksSection />
        {dailyOracleSlot}
        <MethodsSection />
        <PremiumSection isLoggedIn={isLoggedIn} />
        <WaitlistSection />
        <TestimonialsSection />
        <FinalCtaSection isLoggedIn={isLoggedIn} />
      </main>
    </div>
  );
}
