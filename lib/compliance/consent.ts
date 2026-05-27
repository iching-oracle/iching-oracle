import type { ConsentState } from "@/types/trust";

export const CONSENT_VERSION = 1;
export const CONSENT_STORAGE_KEY = "iching-consent-v1";

export const DEFAULT_CONSENT: ConsentState = {
  version: CONSENT_VERSION,
  essential: true,
  analytics: false,
  marketing: false,
  updatedAt: new Date(0).toISOString(),
};

export function parseConsent(raw: string | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.version !== CONSENT_VERSION) return null;
    if (parsed.essential !== true) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(consent: ConsentState | null): boolean {
  return consent?.analytics === true;
}
