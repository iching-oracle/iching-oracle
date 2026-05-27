import Link from "next/link";
import { auth } from "@/auth";
import { ContactForm } from "@/components/support/contact-form";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Support",
  description: "Get help with readings, billing, refunds, and technical issues.",
  path: "/support",
});

export default async function SupportPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-xl px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-16">
      <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold">
        Support
      </p>
      <h1 className="mt-2 font-serif text-3xl text-foreground">How can we help?</h1>
      <p className="mt-2 text-sm text-zen-muted">
        We respond with care, usually within two business days. For refunds, see our{" "}
        <Link href="/refund-policy" className="text-amber-gold hover:underline">
          refund policy
        </Link>
        .
      </p>
      <div className="mt-8">
        <ContactForm
          userEmail={session?.user?.email ?? ""}
          userName={session?.user?.name ?? ""}
        />
      </div>
    </div>
  );
}
