import "server-only";

import { isBetaFeatureEnabled } from "@/lib/beta/config";

export type BetaFeatureFlag =
  | "guided-onboarding-v2"
  | "experimental-prompts"
  | "daily-oracle-email"
  | "pattern-insights";

const DEFAULT_FLAGS: Record<BetaFeatureFlag, boolean> = {
  "guided-onboarding-v2": false,
  "experimental-prompts": false,
  "daily-oracle-email": true,
  "pattern-insights": true,
};

export function isFeatureEnabled(
  flag: BetaFeatureFlag,
  cohort?: { isBetaMember?: boolean },
): boolean {
  if (cohort?.isBetaMember === false && flag.startsWith("experimental")) {
    return false;
  }
  if (!isBetaFeatureEnabled(flag)) return false;
  return DEFAULT_FLAGS[flag] ?? false;
}
