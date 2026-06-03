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

export const LEGAL_OPERATOR = {
  name: "I Ching Oracle",
  legalName: "Martin Yeh",
  street: "Richard-Strauss-Straße 21A",
  postalCode: "81677",
  city: "München",
  country: "Deutschland",
  email: "privacy@ichingoracle.de",
  contactEmail: "support@ichingoracle.de",
  website: "https://www.ichingoracle.de",
  responsiblePerson: "Martin Yeh",
  vatId: "Keine Umsatzsteuer-Identifikationsnummer angegeben.",
  registerCourt: "Nicht im Handelsregister eingetragen.",
} as const;

const COMPANY = LEGAL_OPERATOR.name;
const CONTACT_EMAIL = LEGAL_OPERATOR.email;
const SUPPORT_EMAIL = LEGAL_OPERATOR.contactEmail;

export const PRIVACY_POLICY: LegalDocument = {
  slug: "privacy",
  title: "Privacy Policy",
  description: `How ${COMPANY} collects, uses, and protects your personal data under the GDPR and applicable privacy laws.`,
  lastUpdated: "2026-06-02",
  sections: [
    {
      id: "controller",
      title: "Data controller",
      paragraphs: [
        `${LEGAL_OPERATOR.legalName} (“${COMPANY}”, “we”, “us”) operates ${LEGAL_OPERATOR.website}.`,
        `For privacy-related requests, including access, correction, deletion, and objections, contact us at ${CONTACT_EMAIL}.`,
        "We process personal data to provide oracle readings, subscriptions, account services, and related communications.",
      ],
    },
    {
      id: "collect",
      title: "Data we collect",
      paragraphs: ["Depending on how you use the service, we may process:"],
      list: [
        "Account data: name, email address, password hash (credentials accounts), profile image (if provided)",
        "Authentication data: session identifiers, OAuth subject IDs when you sign in with Google",
        "Reading data: questions, hexagram results, AI interpretations, notes, favorites, and share settings you enable",
        "Payment data: subscription status, Stripe customer and subscription IDs, billing period metadata (payment card details are processed by Stripe and not stored by us)",
        "Usage data: credits consumed, feature usage, language preferences, and technical logs",
        "Communications: support messages, waitlist sign-ups, and lifecycle emails you opt into",
        "Consent records: cookie and analytics preferences stored on your device",
        "Visitor identifiers: anonymous cookie for guest daily oracle features (where applicable)",
      ],
    },
    {
      id: "legal-basis",
      title: "Legal basis (GDPR)",
      paragraphs: ["We rely on the following legal bases under Articles 6 and 9 GDPR:"],
      list: [
        "Contract (Art. 6(1)(b)) — to deliver readings, subscriptions, credits, and account features you request",
        "Legitimate interests (Art. 6(1)(f)) — security, fraud prevention, service improvement, and limited operational analytics where permitted",
        "Consent (Art. 6(1)(a)) — optional analytics/marketing cookies, non-essential emails, and public sharing of readings you explicitly enable",
        "Legal obligation (Art. 6(1)(c)) — tax, accounting, and regulatory requirements where applicable",
      ],
    },
    {
      id: "google-auth",
      title: "Google sign-in",
      paragraphs: [
        "If you choose “Continue with Google”, we receive information from Google OAuth such as your email address, name, and profile image (if available), as permitted by your Google account settings.",
        "Google processes your data under its own privacy policy. We use the information solely to create and maintain your account and authenticate sessions.",
        "You can disconnect Google access from your Google account security settings; you may still need a password or another sign-in method if required by your account configuration.",
      ],
    },
    {
      id: "stripe",
      title: "Stripe payments",
      paragraphs: [
        "Premium subscriptions and billing are handled by Stripe, Inc. When you checkout, Stripe collects payment details directly on their secure pages.",
        "We receive limited billing metadata from Stripe (e.g. customer ID, subscription status, invoice references) to activate Premium features and manage your account.",
        "Stripe’s privacy notice applies to payment processing: https://stripe.com/privacy",
      ],
    },
    {
      id: "email",
      title: "Email communications",
      paragraphs: [
        "We send transactional emails (e.g. email verification, password reset, billing-related notices) via our email provider (Resend) when necessary to operate your account.",
        "With your consent or where permitted, we may send lifecycle emails such as daily guidance, weekly reflections, or product updates. You can manage preferences in account settings or unsubscribe via links in each message.",
        "Email delivery logs may include timestamps and delivery status for troubleshooting and compliance.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies and sessions",
      paragraphs: [
        "We use cookies and similar technologies for authentication, security, preferences, and (with consent) analytics.",
      ],
      list: [
        "Session / auth cookies (NextAuth) — required to keep you signed in",
        "Consent storage — remembers your cookie and analytics choices",
        "Visitor cookie — optional identifier for guest daily oracle continuity",
        "Analytics cookies — only if you accept them in the cookie banner (see Analytics section)",
      ],
    },
    {
      id: "ai",
      title: "AI-generated content",
      paragraphs: [
        "Your questions and hexagram context may be sent to our AI provider (DeepSeek) to generate interpretations and pattern insights.",
        "We do not use your readings to train public AI models. Prompts are processed to deliver your session and related features only.",
        "AI output is generated automatically and may be inaccurate, incomplete, or inappropriate for your situation. It is not professional, medical, legal, or financial advice.",
        "You are responsible for how you use AI-generated text. See our Terms of Service and spiritual disclaimer for further limitations.",
      ],
    },
    {
      id: "analytics",
      title: "Analytics",
      paragraphs: [
        "With your consent, we may use privacy-oriented product analytics (e.g. PostHog) and/or Google Analytics to understand feature usage and improve the experience.",
        "Analytics data is aggregated where possible and configured to minimize personal identifiers. You can withdraw consent at any time via the cookie preferences control in the footer.",
        "If analytics are disabled, we still collect essential server logs for security and reliability.",
      ],
    },
    {
      id: "sharing",
      title: "Sharing and processors",
      paragraphs: [
        "We do not sell your personal data. We share data with trusted processors only as needed to operate the service:",
      ],
      list: [
        "Stripe — payment processing",
        "Google — OAuth authentication (if you choose Google sign-in)",
        "Resend — transactional and lifecycle email delivery",
        "DeepSeek — AI interpretation processing",
        "Hosting and database providers — application infrastructure (e.g. Vercel, PostgreSQL)",
        "Analytics providers — only if you consent (e.g. PostHog, Google Analytics)",
      ],
    },
    {
      id: "retention",
      title: "Retention",
      paragraphs: [
        "Account and reading data are kept while your account is active.",
        "After account deletion, we remove or anonymize personal data within a reasonable period, except where law requires longer retention (e.g. billing records).",
        "Backups may retain deleted data for a limited technical window before automatic purging.",
      ],
    },
    {
      id: "rights",
      title: "Your rights",
      paragraphs: [
        "If you are in the EEA, UK, or Switzerland, you may have the right to:",
      ],
      list: [
        "Access, rectify, or erase your personal data",
        "Restrict or object to certain processing",
        "Data portability",
        "Withdraw consent for optional cookies or marketing emails",
        "Lodge a complaint with your supervisory authority (e.g. your local data protection authority in Germany)",
      ],
    },
    {
      id: "deletion",
      title: "Data deletion requests",
      paragraphs: [
        "You can delete your account from account settings when signed in. This removes your profile and associated readings from active systems, subject to backup retention windows.",
        `To request deletion or export of data without signing in, email ${CONTACT_EMAIL} from the address associated with your account. We may ask for reasonable verification.`,
        `For general support (non-privacy), contact ${SUPPORT_EMAIL} via our support page.`,
      ],
    },
    {
      id: "international",
      title: "International transfers",
      paragraphs: [
        "Some processors may process data outside the European Economic Area (e.g. United States). Where required, we rely on appropriate safeguards such as Standard Contractual Clauses or equivalent mechanisms.",
      ],
    },
    {
      id: "children",
      title: "Children",
      paragraphs: [
        "The service is not directed at children under 16. We do not knowingly collect personal data from children. Contact us if you believe a child has provided data.",
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      paragraphs: [
        "We may update this Privacy Policy from time to time. Material changes will be posted on this page with an updated “Last updated” date.",
      ],
    },
  ],
};

export const TERMS_OF_SERVICE: LegalDocument = {
  slug: "terms",
  title: "Terms of Service",
  description: `Terms governing use of ${COMPANY}, including subscriptions, AI-generated content, and spiritual guidance limitations.`,
  lastUpdated: "2026-06-02",
  sections: [
    {
      id: "acceptance",
      title: "Agreement",
      paragraphs: [
        `By accessing or using ${COMPANY} at ${LEGAL_OPERATOR.website}, you agree to these Terms of Service (“Terms”). If you do not agree, do not use the service.`,
        "If you purchase Premium, additional billing terms in our Refund Policy apply where referenced.",
      ],
    },
    {
      id: "disclaimer-spiritual",
      title: "Entertainment and spiritual guidance",
      paragraphs: [
        "The I Ching is an ancient symbolic system used for reflection and perspective — not deterministic fortune-telling.",
        `${COMPANY} presents readings as contemplative, spiritual, and entertainment-oriented guidance. We make no guarantee of outcomes, accuracy of predictions, or suitability for any particular decision.`,
        "You must not rely on the service as a substitute for professional advice (medical, psychological, legal, financial, or otherwise).",
      ],
    },
    {
      id: "ai",
      title: "AI-generated interpretations",
      paragraphs: [
        "Interpretations and pattern insights are produced by artificial intelligence based on your question, cast symbols, and related context.",
        "AI may hallucinate, generalize, omit nuance, or reflect biases present in training data. Always apply your own judgment, values, and circumstances.",
        "We do not warrant that AI output is complete, current, or appropriate for your situation.",
      ],
    },
    {
      id: "user-responsibility",
      title: "Your responsibility",
      paragraphs: [
        "You are solely responsible for decisions you make and actions you take based on (or inspired by) readings or AI text.",
        "The oracle is offered as a mirror for reflection — not as an authority over your life, relationships, health, or finances.",
        "If you are in crisis or considering self-harm, contact local emergency services or a qualified crisis helpline immediately. This platform is not equipped to provide crisis intervention.",
      ],
    },
    {
      id: "service",
      title: "The service",
      paragraphs: [
        "We provide digital I Ching-inspired readings with AI-assisted interpretation for personal reflection.",
        'The service is provided "as is" and may change, pause, or discontinue features with reasonable notice where practical.',
      ],
    },
    {
      id: "accounts",
      title: "Accounts",
      paragraphs: [
        "You are responsible for safeguarding your login credentials and for all activity under your account.",
        "You must provide accurate registration information and keep it updated.",
        "We may suspend or terminate accounts that violate these Terms or pose security or abuse risks.",
      ],
    },
    {
      id: "subscriptions",
      title: "Subscriptions and payments",
      paragraphs: [
        "Premium features may require a paid subscription processed by Stripe. Pricing and billing intervals are shown at checkout.",
        "Subscriptions renew automatically unless cancelled before the renewal date through billing settings or the Stripe customer portal.",
        "Credits and quotas are consumed when features are delivered; unused credits may not roll over except where explicitly stated.",
        "We may change pricing with notice; changes typically apply to subsequent billing periods.",
      ],
    },
    {
      id: "refunds",
      title: "Refunds and cancellations",
      paragraphs: [
        "You may cancel Premium at any time; access generally continues until the end of the current paid period.",
        "Unless required by applicable consumer law, we do not provide prorated refunds for partial billing periods after renewal.",
        "Credits used for completed readings or AI features are generally non-refundable once the service has been delivered.",
        "See our Refund Policy for details on technical failures and how to request review.",
      ],
    },
    {
      id: "termination",
      title: "Account termination",
      paragraphs: [
        "You may delete your account at any time from account settings.",
        "We may terminate or suspend access immediately for material breach, fraud, abuse, or legal requirements.",
        "Upon termination, your right to use the service ceases; provisions that by nature should survive (e.g. disclaimers, liability limits) remain in effect.",
      ],
    },
    {
      id: "ugc",
      title: "Your content",
      paragraphs: [
        "You retain ownership of questions and notes you submit. You grant us a limited license to host, process, and display that content to operate the service.",
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
        "Attempt to bypass credit limits, paywalls, or access controls",
        "Misrepresent AI output as guaranteed fact or professional advice",
        "Resell or commercially exploit the service without written permission",
      ],
    },
    {
      id: "ip",
      title: "Intellectual property",
      paragraphs: [
        "The platform design, branding, and original materials are owned by us or our licensors. Classical I Ching texts are in the public domain; our presentation, software, and AI layers are protected.",
      ],
    },
    {
      id: "liability",
      title: "Limitation of liability",
      paragraphs: [
        "To the fullest extent permitted by law, we are not liable for indirect, incidental, special, or consequential damages arising from use of the service, including reliance on readings or AI output.",
        "Our total liability for any claim is limited to the amount you paid us in the twelve months before the claim, or €50, whichever is greater, where permitted by mandatory law.",
        "Nothing in these Terms excludes liability for death, personal injury caused by negligence, fraud, or other liability that cannot be excluded under applicable law.",
      ],
    },
    {
      id: "law",
      title: "Governing law",
      paragraphs: [
        "These Terms are governed by the laws of Germany, without regard to conflict-of-law rules, unless mandatory consumer protections in your country require otherwise.",
        "Disputes may be brought before the courts of our place of business where permitted, or before courts in your country of residence if required by consumer law.",
      ],
    },
  ],
};

export const IMPRESSUM: LegalDocument = {
  slug: "impressum",
  title: "Impressum",
  description: `Legal notice and provider identification for ${COMPANY} pursuant to German law (Telemediengesetz / Digitale-Dienste-Gesetz).`,
  lastUpdated: "2026-06-02",
  sections: [
    {
      id: "provider",
      title: "Diensteanbieter",
      paragraphs: [
        `Angaben gemäß § 5 DDG (ehem. § 5 TMG) und Verantwortlichkeit nach § 18 Abs. 2 MStV:`,
      ],
      list: [
        `${LEGAL_OPERATOR.legalName}`,
        `${LEGAL_OPERATOR.street}`,
        `${LEGAL_OPERATOR.postalCode} ${LEGAL_OPERATOR.city}`,
        LEGAL_OPERATOR.country,
      ],
    },
    {
      id: "contact",
      title: "Kontakt",
      paragraphs: [
        `E-Mail: ${LEGAL_OPERATOR.contactEmail}`,
        `Datenschutz / Privacy: ${LEGAL_OPERATOR.email}`,
        `Website: ${LEGAL_OPERATOR.website}`,
      ],
    },
    {
      id: "responsible",
      title: "Verantwortlich für den Inhalt",
      paragraphs: [
        `Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: ${LEGAL_OPERATOR.responsiblePerson}`,
        `${LEGAL_OPERATOR.street}, ${LEGAL_OPERATOR.postalCode} ${LEGAL_OPERATOR.city}`,
      ],
    },
    {
      id: "register",
      title: "Registerangaben",
      paragraphs: [
        `Umsatzsteuer-ID: ${LEGAL_OPERATOR.vatId}`,
        LEGAL_OPERATOR.registerCourt,
      ],
    },
    {
      id: "dispute",
      title: "EU-Streitschlichtung",
      paragraphs: [
        "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr",
        "Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen, sofern nicht gesetzlich zwingend.",
      ],
    },
    {
      id: "liability-content",
      title: "Haftung für Inhalte",
      paragraphs: [
        "Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.",
        "KI-generierte Texte dienen der persönlichen Reflexion und stellen keine verbindliche Beratung dar. Nutzerinnen und Nutzer sind für die Bewertung der Inhalte selbst verantwortlich.",
      ],
    },
    {
      id: "liability-links",
      title: "Haftung für Links",
      paragraphs: [
        "Unser Angebot enthält Links zu externen Websites Dritter. Auf deren Inhalte haben wir keinen Einfluss; für diese fremden Inhalte übernehmen wir keine Gewähr.",
      ],
    },
    {
      id: "copyright",
      title: "Urheberrecht",
      paragraphs: [
        "Die durch den Betreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.",
        "Vervielfältigung, Bearbeitung und Verbreitung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung.",
      ],
    },
  ],
};

export const DISCLAIMER: LegalDocument = {
  slug: "disclaimer",
  title: "Spiritual & AI Disclaimer",
  description:
    "Important limitations on oracle readings, AI interpretation, and spiritual guidance.",
  lastUpdated: "2026-06-02",
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
  lastUpdated: "2026-06-02",
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
        `Email ${SUPPORT_EMAIL} or use the support form with your account email, date of charge, and description. Stripe receipt IDs help us resolve requests faster.`,
      ],
    },
  ],
};

export const COOKIE_POLICY: LegalDocument = {
  slug: "cookies",
  title: "Cookie Policy",
  description: "How we use cookies and similar technologies.",
  lastUpdated: "2026-06-02",
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
        "Visitor identifier for guest daily oracle (where used)",
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
  impressum: IMPRESSUM,
  disclaimer: DISCLAIMER,
  "refund-policy": REFUND_POLICY,
  cookies: COOKIE_POLICY,
};
