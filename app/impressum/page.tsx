import { LegalPageLayout, legalMetadata } from "@/components/legal/legal-page-layout";
import { IMPRESSUM } from "@/lib/legal/content";

export const metadata = legalMetadata(IMPRESSUM);

export default function ImpressumPage() {
  return <LegalPageLayout doc={IMPRESSUM} />;
}
