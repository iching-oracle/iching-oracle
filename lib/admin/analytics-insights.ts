import "server-only";

import type { ProductInsight } from "@/types/product-insight";

export type { ProductInsight };

type InsightInput = {
  categoryCounts: Array<{ category: string; count: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  funnelReading: Array<{ step: string; count: number }>;
  funnelSignup: Array<{ step: string; count: number }>;
  retention: { d1: number; d7: number; d30: number };
  readingCompletionRate: number;
  conversionRate: number;
  onboardingStarted30d: number;
  questionSubmitted30d: number;
};

/**
 * Rule-based insight cards for the admin dashboard.
 * Extend with ML or PostHog trends later.
 */
export function generateProductInsights(input: InsightInput): ProductInsight[] {
  const insights: ProductInsight[] = [];

  const sorted = [...input.categoryCounts].sort((a, b) => b.count - a.count);
  if (sorted.length >= 2 && sorted[0]!.count > 0) {
    const top = sorted[0]!;
    const second = sorted[1]!;
    const ratio = second.count > 0 ? top.count / second.count : top.count;
    if (ratio >= 1.5) {
      insights.push({
        id: "category-leader",
        type: "trend",
        title: `${capitalize(top.category)} leads interest`,
        body: `${capitalize(top.category)} readings are ${ratio.toFixed(1)}× more common than ${second.category} this month.`,
        severity: "info",
      });
    }
  }

  const mobile = input.deviceBreakdown.find((d) => d.device === "mobile");
  const desktop = input.deviceBreakdown.find((d) => d.device === "desktop");
  const mobileCount = mobile?.count ?? 0;
  const desktopCount = desktop?.count ?? 0;
  const totalDevice = mobileCount + desktopCount;
  if (totalDevice > 20 && mobileCount > desktopCount * 1.2) {
    const dropPct = estimateOnboardingDrop(input);
    if (dropPct > 25) {
      insights.push({
        id: "mobile-dropoff",
        type: "anomaly",
        title: "Mobile onboarding friction",
        body: `Mobile traffic is high (${Math.round((mobileCount / totalDevice) * 100)}% of sessions). Onboarding drop-off is ~${dropPct}% between start and question submit — review mobile UX.`,
        severity: "warning",
      });
    }
  }

  if (input.retention.d7 > input.retention.d1 && input.retention.d7 > 15) {
    insights.push({
      id: "retention-healthy",
      type: "growth",
      title: "Week-one retention is building",
      body: `D7 retention is ${input.retention.d7.toFixed(0)}%. Users who return within a week are your core audience — nurture with follow-up prompts.`,
      severity: "positive",
    });
  }

  if (input.readingCompletionRate < 70 && input.readingCompletionRate > 0) {
    insights.push({
      id: "completion-low",
      type: "anomaly",
      title: "Reading completion below target",
      body: `Only ${input.readingCompletionRate.toFixed(0)}% of generated readings reach completion. Check ritual timing and progressive reveal pacing.`,
      severity: "warning",
    });
  }

  if (input.conversionRate > 5) {
    insights.push({
      id: "conversion-growth",
      type: "growth",
      title: "Paid conversion trending",
      body: `${input.conversionRate.toFixed(1)}% of users are on Premium. Highlight follow-up chat for free users to deepen engagement before upgrade.`,
      severity: "positive",
    });
  }

  const followUpStep = input.funnelSignup.find(
    (s) => s.step === "followup_question",
  );
  if (followUpStep && followUpStep.count > 5) {
    insights.push({
      id: "followup-retention",
      type: "trend",
      title: "Follow-ups signal retention",
      body: "Users who ask follow-up questions tend to retain longer. Surface the follow-up CTA prominently after each reading.",
      severity: "info",
    });
  }

  return insights.slice(0, 6);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

function estimateOnboardingDrop(input: InsightInput): number {
  if (input.onboardingStarted30d === 0) return 0;
  const drop =
    ((input.onboardingStarted30d - input.questionSubmitted30d) /
      input.onboardingStarted30d) *
    100;
  return Math.max(0, Math.round(drop));
}
