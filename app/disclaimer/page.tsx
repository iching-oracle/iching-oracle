import { LegalPageLayout, legalMetadata } from "@/components/legal/legal-page-layout";
import { DISCLAIMER } from "@/lib/legal/content";

export const metadata = legalMetadata(DISCLAIMER);

export default function DisclaimerPage() {
  return <LegalPageLayout doc={DISCLAIMER} />;
}
