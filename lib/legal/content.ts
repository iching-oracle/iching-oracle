export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  list?: string[];
};

export type LegalDocument = {
  slug: string;
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
};

const COMPANY = "I Ching Oracle";
const CONTACT_EMAIL = "privacy@iching-oracle.com";

export const PRIVACY_POLICY: LegalDocument = {
  slug: "privacy",
  title: "Privacy Policy",
  description: `How ${COMPANY} collects, uses, and protects your personal data under GDPR and applicable privacy laws.`,
  lastUpdated: "2026-05-28",
  sections: [
    {
      id: "controller",
      title: "Data controller",
      paragraphs: [
        `${COMPANY} operates this platform. For privacy-related requests, contact us at ${CONTACT_EMAIL}.`,
        "We process personal data to provide oracle readings, subscriptions, and account services.",
      ],
    },
    {
      id: "collect",
      title: "Data we collect",
      paragraphs: ["Depending on how you use the service, we may process:"],
      list: [
        "Account data: name, email address, authentication identifiers",
        "Reading data: questions, hexagram results, AI interpretations, notes you save",
        "Payment data: billing status and Stripe customer IDs (card details are handled by Stripe, not stored by us)",
        "Usage data: credits consumed, feature usage, and technical logs",
        "Communications: support messages and optional waitlist sign-ups",
        "Consent records: cookie preferences stored on your device",
      ],
    },
    {
      id: "legal-basis",
      title: "Legal basis (GDPR)",
      paragraphs: ["We rely on the following legal bases:"],
      list: [
        "Contract — to deliver readings, subscriptions, and account features you request",
        "Legitimate interests — security, fraud prevention, service improvement, and anonymized analytics (where consented)",
        "Consent — optional analytics/marketing cookies and public sharing of readings you explicitly enable",
        "Legal obligation — tax, accounting, and regulatory requirements where applicable",
      ],
    },
    {
      id: "ai",
      title: "AI processing",
      paragraphs: [
        "Your questions and hexagram context may be sent to our AI provider (DeepSeek) to generate interpretations.",
        "We do not use your readings to train public models. Prompts are processed to deliver your session only.",
        "AI output is generated automatically and may be inaccurate. It is not professional advice.",
      ],
    },
    {
      id: "sharing",
      title: "Sharing and processors",
      paragraphs: ["We use trusted processors, including:"],
      list: [
        "Stripe — payment processing",
        "Hosting and database providers — application infrastructure",
        "Email provider (e.g. Resend) — verification and transactional email",
        "Analytics (only if you consent) — e.g. PostHog or Google Analytics",
      ],
    },
    {
      id: "retention",
      title: "Retention",
      paragraphs: [
        "Account and reading data are kept while your account is active. You may delete your account at any time.",
        "After deletion, we remove or anonymize personal data within a reasonable period, except where law requires retention.",
      ],
    },
    {
      id: "rights",
      title: "Your rights",
      paragraphs: ["If you are in the EEA/UK, you may have the right to:"],
      list: [
        "Access, rectify, or erase your personal data",
        "Restrict or object to certain processing",
        "Data portability",
        "Withdraw consent for optional cookies",
        "Lodge a complaint with your supervisory authority",
      ],
    },
    {
      id: "deletion",
      title: "Account deletion",
      paragraphs: [
        "You can delete your account from account settings. This removes your profile and associated readings from our active systems, subject to backup retention windows.",
      ],
    },
    {
      id: "international",
      title: "International transfers",
      paragraphs: [
        "If data is processed outside your country, we use appropriate safeguards such as Standard Contractual Clauses where required.",
      ],
    },
    {
      id: "children",
      title: "Children",
      paragraphs: [
        "The service is not directed at children under 16. We do not knowingly collect data from children.",
      ],
    },
    {
      id: "changes",
      title: "Changes",
      paragraphs: [
        "We may update this policy. Material changes will be posted on this page with an updated date.",
      ],
    },
  ],
};

export const TERMS_OF_SERVICE: LegalDocument = {
  slug: "terms",
  title: "Terms of Service",
  description: `Terms governing use of ${COMPANY}, including subscriptions and AI-generated content.`,
  lastUpdated: "2026-05-28",
  sections: [
    {
      id: "acceptance",
      title: "Agreement",
      paragraphs: [
        `By using ${COMPANY}, you agree to these Terms. If you do not agree, do not use the service.`,
      ],
    },
    {
      id: "service",
      title: "The service",
      paragraphs: [
        "We provide digital I Ching-inspired readings with AI-assisted interpretation for personal reflection.",
        "The service is provided \"as is\" and may change, pause, or discontinue features with reasonable notice where practical.",
      ],
    },
    {
      id: "accounts",
      title: "Accounts",
      paragraphs: [
        "You are responsible for safeguarding your login credentials and for activity under your account.",
        "You must provide accurate registration information and keep it updated.",
      ],
    },
    {
      id: "subscriptions",
      title: "Subscriptions and credits",
      paragraphs: [
        "Premium features may require a paid subscription or credits. Pricing is shown at checkout.",
        "Payments are processed by Stripe. Subscription renewal and cancellation are managed through billing settings or the Stripe customer portal.",
      ],
    },
    {
      id: "ugc",
      title: "Your content",
      paragraphs: [
        "You retain ownership of questions and notes you submit. You grant us a limited license to host and process that content to operate the service.",
        "If you enable public sharing, you are responsible for what you publish. Do not share content that violates others' rights or applicable law.",
      ],
    },
    {
      id: "prohibited",
      title: "Acceptable use",
      paragraphs: ["You agree not to:"],
      list: [
        "Abuse, scrape, or reverse-engineer the platform",
        "Use the service for unlawful harassment, hate, or exploitation",
        "Attempt to bypass credit limits or access controls",
        "Misrepresent AI output as guaranteed fact or professional advice",
      ],
    },
    {
      id: "ip",
      title: "Intellectual property",
      paragraphs: [
        "The platform design, branding, and original materials are owned by us or our licensors. I Ching texts are in the public domain; our presentation and AI layers are protected.",
      ],
    },
    {
      id: "liability",
      title: "Limitation of liability",
      paragraphs: [
        "To the fullest extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from use of the service.",
        "Our total liability for any claim is limited to the amount you paid us in the twelve months before the claim, or €50, whichever is greater, where permitted by law.",
      ],
    },
    {
      id: "law",
      title: "Governing law",
      paragraphs: [
        "These Terms are governed by the laws applicable to the operator's place of business, without regard to conflict-of-law rules. Mandatory consumer protections in your country still apply.",
      ],
    },
  ],
};

export const DISCLAIMER: LegalDocument = {
  slug: "disclaimer",
  title: "Spiritual & AI Disclaimer",
  description:
    "Important limitations on oracle readings, AI interpretation, and spiritual guidance.",
  lastUpdated: "2026-05-28",
  sections: [
    {
      id: "nature",
      title: "Nature of the oracle",
      paragraphs: [
        "The I Ching is an ancient symbolic system used for reflection and perspective — not deterministic fortune-telling.",
        `${COMPANY} presents readings as contemplative guidance. Outcomes are not guaranteed.`,
      ],
    },
    {
      id: "ai",
      title: "AI-generated content",
      paragraphs: [
        "Interpretations are produced by artificial intelligence based on your question and cast symbols.",
        "AI may hallucinate, generalize, or miss nuance. Always apply your own judgment and context.",
        "AI output is not medical, psychological, legal, or financial advice. Seek qualified professionals for those matters.",
      ],
    },
    {
      id: "decisions",
      title: "Your decisions",
      paragraphs: [
        "You are solely responsible for choices you make. The oracle is a mirror — not an authority over your life.",
      ],
    },
    {
      id: "crisis",
      title: "Crisis support",
      paragraphs: [
        "If you are in crisis or considering self-harm, please contact local emergency services or a qualified crisis helpline immediately. This platform is not equipped to provide crisis intervention.",
      ],
    },
  ],
};

export const REFUND_POLICY: LegalDocument = {
  slug: "refund-policy",
  title: "Refund Policy",
  description: "How refunds and subscription cancellations work.",
  lastUpdated: "2026-05-28",
  sections: [
    {
      id: "subscriptions",
      title: "Subscriptions",
      paragraphs: [
        "You may cancel Premium at any time via billing settings. Access continues until the end of the current billing period.",
        "Unless required by law, we do not provide prorated refunds for partial billing periods after renewal.",
      ],
    },
    {
      id: "credits",
      title: "Credits",
      paragraphs: [
        "Credits consumed for completed readings or AI features are generally non-refundable, as the underlying service has been delivered.",
      ],
    },
    {
      id: "errors",
      title: "Service failures",
      paragraphs: [
        "If a technical failure prevented delivery of a paid feature (e.g. interpretation never generated after credit charge), contact support within 14 days. We will review and may restore credits or issue a refund at our discretion.",
      ],
    },
    {
      id: "how",
      title: "How to request",
      paragraphs: [
        `Email ${CONTACT_EMAIL} or use the support form with your account email, date of charge, and description. Stripe receipt IDs help us resolve requests faster.`,
      ],
    },
  ],
};

export const COOKIE_POLICY: LegalDocument = {
  slug: "cookies",
  title: "Cookie Policy",
  description: "How we use cookies and similar technologies.",
  lastUpdated: "2026-05-28",
  sections: [
    {
      id: "what",
      title: "What are cookies?",
      paragraphs: [
        "Cookies are small text files stored on your device. We also use similar technologies such as local storage for consent preferences.",
      ],
    },
    {
      id: "essential",
      title: "Essential cookies",
      paragraphs: [
        "Required for authentication, security, and core functionality. These cannot be disabled while using the service.",
      ],
      list: [
        "Session / auth tokens (NextAuth)",
        "Consent preference storage",
      ],
    },
    {
      id: "analytics",
      title: "Analytics cookies (optional)",
      paragraphs: [
        "With your consent, we may use analytics to understand usage and improve the experience.",
      ],
      list: [
        "PostHog — product analytics (if enabled)",
        "Google Analytics — aggregated traffic (if enabled)",
      ],
    },
    {
      id: "control",
      title: "Your choices",
      paragraphs: [
        "Use the cookie banner or footer link to update preferences. You may also clear cookies in your browser settings.",
      ],
    },
  ],
};

export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
  privacy: PRIVACY_POLICY,
  terms: TERMS_OF_SERVICE,
  disclaimer: DISCLAIMER,
  "refund-policy": REFUND_POLICY,
  cookies: COOKIE_POLICY,
};
