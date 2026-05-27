"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CONSENT_STORAGE_KEY,
  DEFAULT_CONSENT,
  parseConsent,
} from "@/lib/compliance/consent";
import type { ConsentState } from "@/types/trust";
import { CookieBanner } from "@/components/trust/cookie-banner";
import { CookiePreferencesModal } from "@/components/trust/cookie-preferences-modal";
import { AnalyticsScripts } from "@/components/trust/analytics-scripts";

type ConsentContextValue = {
  consent: ConsentState | null;
  hasChosen: boolean;
  acceptAll: () => void;
  rejectOptional: () => void;
  savePreferences: (analytics: boolean, marketing: boolean) => void;
  openPreferences: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within ConsentProvider");
  }
  return ctx;
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [hasChosen, setHasChosen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY));
    if (stored) {
      setConsent(stored);
      setHasChosen(true);
    }
    setMounted(true);
  }, []);

  const persist = useCallback((next: ConsentState) => {
    const withTime = { ...next, updatedAt: new Date().toISOString() };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(withTime));
    setConsent(withTime);
    setHasChosen(true);
    setPrefsOpen(false);
  }, []);

  const acceptAll = useCallback(() => {
    persist({
      ...DEFAULT_CONSENT,
      analytics: true,
      marketing: false,
      updatedAt: new Date().toISOString(),
    });
  }, [persist]);

  const rejectOptional = useCallback(() => {
    persist({ ...DEFAULT_CONSENT, updatedAt: new Date().toISOString() });
  }, [persist]);

  const savePreferences = useCallback(
    (analytics: boolean, marketing: boolean) => {
      persist({
        ...DEFAULT_CONSENT,
        analytics,
        marketing,
        updatedAt: new Date().toISOString(),
      });
    },
    [persist],
  );

  const value = useMemo(
    () => ({
      consent,
      hasChosen,
      acceptAll,
      rejectOptional,
      savePreferences,
      openPreferences: () => setPrefsOpen(true),
    }),
    [consent, hasChosen, acceptAll, rejectOptional, savePreferences],
  );

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {mounted && (
        <>
          {!hasChosen && <CookieBanner />}
          <CookiePreferencesModal
            open={prefsOpen}
            onClose={() => setPrefsOpen(false)}
            initialAnalytics={consent?.analytics ?? false}
            initialMarketing={consent?.marketing ?? false}
            onSave={savePreferences}
          />
          <AnalyticsScripts consent={consent} />
        </>
      )}
    </ConsentContext.Provider>
  );
}
