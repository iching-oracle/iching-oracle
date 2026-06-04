import Link from "next/link";
import { auth } from "@/auth";
import { AuthAmbient } from "@/components/auth-ambient";
import { ContactForm } from "@/components/contact/contact-form";
import { LEGAL_OPERATOR } from "@/lib/legal/content";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Contact",
  description:
    "Contact I Ching Oracle for support, billing questions, feedback, and partnership inquiries.",
  path: "/contact",
});

export default async function ContactPage() {
  const session = await auth();

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] overflow-hidden">
      <AuthAmbient />
      <div
        className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-amber-gold/8 blur-[100px]"
        aria-hidden
      />

      <main className="relative z-10 mx-auto max-w-xl px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-16">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold">
          Contact
        </p>
        <h1 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
          Get in touch
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-zen-muted sm:text-base">
          Questions about readings, Premium, privacy, or feedback — we read every
          message and usually reply within two business days.
        </p>

        <div className="mt-6 rounded-xl border border-white/[0.06] bg-zen-surface/40 px-4 py-3 text-sm text-zen-muted">
          <p>
            Direct email:{" "}
            <a
              href={`mailto:${LEGAL_OPERATOR.contactEmail}`}
              className="font-medium text-amber-gold transition-colors hover:text-amber-glow"
            >
              {LEGAL_OPERATOR.contactEmail}
            </a>
          </p>
        </div>

        <div className="relative mt-8 rounded-2xl border border-white/[0.08] bg-zen-surface/50 p-6 shadow-[0_24px_64px_-32px_rgba(0,0,0,0.65)] backdrop-blur-sm sm:p-8">
          <ContactForm
            defaultEmail={session?.user?.email ?? ""}
            defaultName={session?.user?.name ?? ""}
          />
        </div>

        <p className="mt-8 text-center text-sm text-zen-muted">
          Billing or refunds? See{" "}
          <Link href="/refund-policy" className="text-amber-gold hover:underline">
            Refund policy
          </Link>{" "}
          ·{" "}
          <Link href="/support" className="text-amber-gold hover:underline">
            Support hub
          </Link>
        </p>
      </main>
    </div>
  );
}
