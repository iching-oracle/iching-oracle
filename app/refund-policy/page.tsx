import { LegalPageLayout, legalMetadata } from "@/components/legal/legal-page-layout";
import { REFUND_POLICY } from "@/lib/legal/content";

export const metadata = legalMetadata(REFUND_POLICY);

export default function RefundPolicyPage() {
  return <LegalPageLayout doc={REFUND_POLICY} />;
}
