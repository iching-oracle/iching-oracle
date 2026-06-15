import { BetaLandingPage } from "@/components/beta/beta-landing-page";
import { buildNoIndexMetadata } from "@/lib/seo/noindex-metadata";

export const metadata = buildNoIndexMetadata({
  title: "Private beta",
  description:
    "Join the private beta of a reflective AI experience inspired by the I Ching.",
  path: "/beta",
});

export default function BetaPage() {
  return <BetaLandingPage />;
}
