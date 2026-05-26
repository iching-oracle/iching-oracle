"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { OracleReadingMessageMeta } from "@/types/oracle-chat";

type OracleCardProps = {
  meta: OracleReadingMessageMeta;
  content: string;
};

export function OracleCard({ meta, content }: OracleCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-amber-gold/35 bg-gradient-to-br from-zen-surface/90 via-zen-elevated/80 to-cosmic-purple/10 p-5 shadow-[0_0_40px_-12px_rgba(197,160,89,0.35)] backdrop-blur-xl"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-gold/15 blur-2xl"
        aria-hidden
      />
      <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold">
        Oracle reading
      </p>
      <p className="mt-2 font-serif text-lg text-foreground">{content}</p>
      <div className="mt-4 flex flex-wrap items-baseline gap-2">
        <span className="text-3xl text-amber-gold">{meta.chineseName}</span>
        <span className="text-sm text-zen-muted">
          {meta.hexagram}. {meta.primaryTitle}
        </span>
        {meta.transformedTitle ? (
          <span className="text-sm text-cosmic-violet">
            → {meta.transformedTitle}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-zen-muted italic">
        {meta.interpretationExcerpt}
      </p>
      <Link
        href={`/history/${meta.readingId}`}
        className="mt-4 inline-flex text-xs font-medium uppercase tracking-widest text-amber-gold hover:underline"
      >
        View full reading →
      </Link>
    </motion.article>
  );
}
