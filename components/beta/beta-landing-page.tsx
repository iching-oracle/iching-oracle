"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BetaWaitlistForm } from "@/components/beta/beta-waitlist-form";

const FAQ = [
  {
    q: "What is the I Ching Oracle beta?",
    a: "A private early access program for a reflective AI experience inspired by the I Ching — designed for contemplation, not prediction.",
  },
  {
    q: "Is this fortune-telling?",
    a: "No. The oracle offers symbolic guidance and emotional clarity — a mirror for your inner questions, not fixed fate.",
  },
  {
    q: "How do invites work?",
    a: "We release spots in small waves to keep the experience intimate. Waitlist members receive a personal invite code by email.",
  },
  {
    q: "Is my data private?",
    a: "Your readings are yours. We never sell personal data. Analytics are privacy-safe and consent-gated.",
  },
];

export function BetaLandingPage() {
  return (
    <div className="relative overflow-hidden bg-zen-bg">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-amber-gold/10 blur-[120px]"
        aria-hidden
      />

      <main className="relative mx-auto max-w-4xl px-6 py-16 sm:px-10 sm:py-24">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-cosmic-violet">
            Private beta
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl">
            Ancient wisdom.
            <br />
            <span className="text-amber-gold">Modern AI guidance.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zen-muted">
            Join the private beta of a new reflective AI experience inspired by
            the I Ching.
          </p>
          <div className="mx-auto mt-10 max-w-md">
            <BetaWaitlistForm source="beta_hero" />
          </div>
          <p className="mt-4 text-xs text-zen-muted">
            Already invited?{" "}
            <Link href="/register" className="text-amber-gold hover:underline">
              Register with your code
            </Link>
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-24 space-y-6"
        >
          <h2 className="font-serif text-2xl text-foreground">What it is</h2>
          <p className="max-w-2xl leading-relaxed text-zen-muted">
            A calm digital space for meaningful questions — combining the symbolic
            depth of the I Ching with thoughtful AI interpretation. Not a chatbot
            for answers, but a companion for reflection.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 grid gap-4 sm:grid-cols-3"
        >
          {[
            {
              title: "Symbolic depth",
              body: "Hexagrams, changing lines, and layered interpretation — not generic advice.",
            },
            {
              title: "Emotional intelligence",
              body: "Guidance that honors your question without exposing private content.",
            },
            {
              title: "A living practice",
              body: "Daily oracle, reading history, and patterns that grow with you over time.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-zen-surface/50 p-6 backdrop-blur-md"
            >
              <h3 className="font-serif text-lg text-amber-gold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zen-muted">
                {item.body}
              </p>
            </div>
          ))}
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 rounded-2xl border border-white/10 bg-zen-surface/40 p-8 sm:p-10"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-zen-muted">
            Social proof
          </p>
          <p className="mt-3 font-serif text-xl text-foreground/90 italic">
            &ldquo;Early explorers describe it as a quiet room for honest
            questions — somewhere between meditation and conversation.&rdquo;
          </p>
          <p className="mt-3 text-sm text-zen-muted">— Beta community (placeholder)</p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 rounded-2xl border border-amber-gold/20 bg-gradient-to-br from-zen-surface/80 to-cosmic-deep/20 p-8 sm:p-10"
        >
          <h2 className="font-serif text-2xl text-foreground">A note from the founder</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-zen-muted">
            I built this because I wanted technology that slows you down instead of
            speeding you up. The beta is small on purpose — every person who joins
            helps shape something genuinely human. Thank you for being here early.
          </p>
          <p className="mt-4 text-sm text-amber-gold/90">— Martin</p>
        </motion.section>

        <section className="mt-20">
          <h2 className="font-serif text-2xl text-foreground">FAQ</h2>
          <dl className="mt-6 space-y-4">
            {FAQ.map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-white/10 bg-zen-surface/30 px-5 py-4"
              >
                <dt className="font-medium text-foreground">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-zen-muted">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-20 text-center">
          <h2 className="font-serif text-2xl text-foreground">Ready to explore?</h2>
          <div className="mx-auto mt-6 max-w-md">
            <BetaWaitlistForm source="beta_footer" variant="compact" />
          </div>
        </section>
      </main>
    </div>
  );
}
