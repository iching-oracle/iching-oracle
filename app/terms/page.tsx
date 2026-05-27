import { LegalPageLayout, legalMetadata } from "@/components/legal/legal-page-layout";
import { TERMS_OF_SERVICE } from "@/lib/legal/content";

export const metadata = legalMetadata(TERMS_OF_SERVICE);

export default function TermsPage() {
  return <LegalPageLayout doc={TERMS_OF_SERVICE} />;
}
