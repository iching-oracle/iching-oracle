import { LegalPageLayout, legalMetadata } from "@/components/legal/legal-page-layout";
import { PRIVACY_POLICY } from "@/lib/legal/content";

export const metadata = legalMetadata(PRIVACY_POLICY);

export default function PrivacyPage() {
  return <LegalPageLayout doc={PRIVACY_POLICY} />;
}
