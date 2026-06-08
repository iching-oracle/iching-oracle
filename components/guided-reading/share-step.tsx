"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { ReadingShareCard } from "@/components/share/reading-share-card";
import { buildGuidedShareCardData } from "@/lib/guided-reading/share-data";
import { downloadShareCardPng } from "@/lib/share/export-image";
import { getFormatSpec } from "@/lib/share/formats";
import { RitualAmbient } from "@/components/guided-reading/ritual-ambient";
import { gentleEase } from "@/lib/guided-reading/motion";
import type { GuidedReadingResult } from "@/types/guided-reading";
import type { ShareCardFormat } from "@/types/share";

type ShareStepProps = {
  result: GuidedReadingResult;
  onDone: () => void;
};

function buildShareUrl(shareId: string | null): string | null {
  if (!shareId || typeof window === "undefined") return null;
  return `${window.location.origin}/share/${shareId}`;
}

export function ShareStep({ result, onDone }: ShareStepProps) {
  const cardData = useMemo(() => buildGuidedShareCardData(result), [result]);
  const exportRef = useRef<HTMLDivElement>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const format: ShareCardFormat = "square";
  const formatSpec = getFormatSpec(format);
  const previewScale = Math.min(1, 300 / formatSpec.width);
  const publicUrl = buildShareUrl(shareId);

  const enableSharing = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/readings/${result.readingId}/share`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: true }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Could not enable sharing");
      }
      const data = (await res.json()) as { shareId: string; isPublic: boolean };
      setShareId(data.shareId);
      setIsPublic(data.isPublic);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sharing failed");
    } finally {
      setBusy(false);
    }
  }, [result.readingId]);

  const copyLink = useCallback(async () => {
    let id = shareId;
    if (!id) {
      setBusy(true);
      try {
        const res = await fetch(`/api/readings/${result.readingId}/share`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublic: true }),
        });
        if (!res.ok) throw new Error("Could not enable sharing");
        const data = (await res.json()) as { shareId: string };
        id = data.shareId;
        setShareId(id);
        setIsPublic(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sharing failed");
        return;
      } finally {
        setBusy(false);
      }
    }
    const url = buildShareUrl(id);
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [shareId, result.readingId]);

  const downloadImage = useCallback(async () => {
    const node = exportRef.current;
    if (!node) return;
    setBusy(true);
    try {
      await downloadShareCardPng(
        node,
        format,
        result.isPremium,
        `oracle-${result.hexagram}.png`,
      );
    } catch {
      setError("Could not export image");
    } finally {
      setBusy(false);
    }
  }, [result.hexagram, result.isPremium]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={gentleEase}
      className="relative min-h-[calc(100dvh-4.5rem)] px-4 py-10 sm:px-6"
      aria-label="Share your reading"
    >
      <RitualAmbient />

      <div className="relative z-10 mx-auto max-w-lg">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-zen-muted">
          Share quietly
        </p>
        <h2 className="mt-2 font-serif text-2xl text-foreground/95">
          A reading to carry
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zen-muted">
          Restrained, editorial — for someone who may need it.
        </p>

        <div className="mt-8 flex justify-center overflow-hidden rounded-2xl border border-white/10 bg-zen-bg/50 p-4">
          <div
            style={{
              transform: `scale(${previewScale})`,
              transformOrigin: "top center",
            }}
          >
            <ReadingShareCard
              data={cardData}
              theme="midnight-gold"
              format={format}
              showWatermark={!result.isPremium}
              animatedGlow={result.isPremium}
            />
          </div>
        </div>

        <div
          ref={exportRef}
          className="pointer-events-none fixed left-[-9999px] top-0"
          aria-hidden
        >
          <ReadingShareCard
            data={cardData}
            theme="midnight-gold"
            format={format}
            showWatermark={!result.isPremium}
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-300">{error}</p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void downloadImage()}
            className="auth-btn-primary text-sm disabled:opacity-50"
          >
            Save as image
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void copyLink()}
            className="rounded-full border border-white/15 py-3 text-sm text-foreground hover:border-amber-gold/30"
          >
            {copied ? "Link copied" : isPublic ? "Copy share link" : "Create & copy link"}
          </button>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-8">
          <Link
            href={`/history/${result.readingId}`}
            className="text-center text-sm text-amber-gold hover:underline"
          >
            View in journal
          </Link>
          <button
            type="button"
            onClick={onDone}
            className="text-sm text-zen-muted hover:text-foreground"
          >
            Return home
          </button>
        </div>
      </div>
    </motion.section>
  );
}
