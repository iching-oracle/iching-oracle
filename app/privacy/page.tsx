import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import PrivacyPolicyPage from "@/components/legal/privacy-policy-de";
import { PRIVACY_POLICY } from "@/lib/legal/content";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung von I Ching Oracle: DSGVO-konforme Informationen zu Konto, KI, Stripe, Cookies und Ihren Rechten.",
  path: "/privacy",
});

type PageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function PrivacyPage({ searchParams }: PageProps) {
  const { lang } = await searchParams;

  if (lang === "en") {
    return <LegalPageLayout doc={PRIVACY_POLICY} />;
  }

  return <PrivacyPolicyPage />;
}
