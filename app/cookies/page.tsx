import { LegalPageLayout, legalMetadata } from "@/components/legal/legal-page-layout";
import { COOKIE_POLICY } from "@/lib/legal/content";

export const metadata = legalMetadata(COOKIE_POLICY);

export default function CookiesPage() {
  return <LegalPageLayout doc={COOKIE_POLICY} />;
}
