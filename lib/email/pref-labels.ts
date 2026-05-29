export type EmailPreferenceKey =
  | "emailDailyGuidance"
  | "emailWeeklyReflection"
  | "emailReengagement"
  | "emailProductUpdates"
  | "emailMarketing";

export const EMAIL_PREF_LABELS: Record<
  EmailPreferenceKey,
  { title: string; description: string }
> = {
  emailDailyGuidance: {
    title: "Daily guidance",
    description: "A short oracle message each morning to begin your day mindfully.",
  },
  emailWeeklyReflection: {
    title: "Weekly reflection",
    description: "A gentle summary of patterns in your recent readings.",
  },
  emailReengagement: {
    title: "Return reminders",
    description: "Soft nudges when you have been away for a while.",
  },
  emailProductUpdates: {
    title: "Product updates",
    description: "New features and improvements to the oracle experience.",
  },
  emailMarketing: {
    title: "Offers & announcements",
    description: "Occasional news about Premium and special offerings.",
  },
};

export const EMAIL_PREF_KEYS = Object.keys(
  EMAIL_PREF_LABELS,
) as EmailPreferenceKey[];
