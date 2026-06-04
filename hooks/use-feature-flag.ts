"use client";

import { useCallback, useEffect, useState } from "react";
import { hasAnalyticsConsent } from "@/lib/compliance/consent";
import { useConsent } from "@/components/trust/consent-provider";
import {
  type FeatureFlagKey,
  getFeatureFlag,
  isFeatureEnabled,
  onFeatureFlagsReady,
} from "@/lib/analytics/feature-flags";

/**
 * GDPR-conscious feature flag hook — only evaluates after analytics consent.
 */
export function useFeatureFlag(flag: FeatureFlagKey): {
  enabled: boolean;
  value: boolean | string | undefined;
  ready: boolean;
} {
  const { consent } = useConsent();
  const canUse = hasAnalyticsConsent(consent);
  const [ready, setReady] = useState(false);
  const [value, setValue] = useState<boolean | string | undefined>(undefined);

  const refresh = useCallback(() => {
    if (!canUse) {
      setValue(undefined);
      setReady(true);
      return;
    }
    setValue(getFeatureFlag(flag));
    setReady(true);
  }, [canUse, flag]);

  useEffect(() => {
    if (!canUse) {
      setValue(undefined);
      setReady(true);
      return;
    }

    refresh();
    return onFeatureFlagsReady(refresh);
  }, [canUse, flag, refresh]);

  return {
    enabled: canUse ? isFeatureEnabled(flag) : false,
    value: canUse ? value : undefined,
    ready,
  };
}
