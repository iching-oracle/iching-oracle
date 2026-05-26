"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
import { ReadingShareCard } from "@/components/share/reading-share-card";
import { downloadShareCardPng } from "@/lib/share/export-image";
import { getFormatSpec, SHARE_FORMATS } from "@/lib/share/formats";
import {
  FREE_SHARE_THEMES,
  getThemeSpec,
  isThemeAllowed,
  SHARE_THEMES,
} from "@/lib/share/themes";
import type {
  ShareCardFormat,
  ShareCardReadingData,
  ShareCardTheme,
} from "@/types/share";

type ShareReadingModalProps = {
  open: boolean;
  onClose: () => void;
  readingId: string;
  cardData: ShareCardReadingData;
  isPremium: boolean;
  initialIsPublic: boolean;
  initialShareId: string | null;
};

function buildShareUrl(shareId: string | null): string | null {
  if (!shareId || typeof window === "undefined") return null;
  return `${window.location.origin}/share/${shareId}`;
}

function twitterShareUrl(url: string, text: string): string {
  const params = new URLSearchParams({
    url,
    text,
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

function facebookShareUrl(url: string): string {
  const params = new URLSearchParams({ u: url });
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

export function ShareReadingModal({
  open,
  onClose,
  readingId,
  cardData,
  isPremium,
  initialIsPublic,
  initialShareId,
}: ShareReadingModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<ShareCardTheme>("midnight-gold");
  const [format, setFormat] = useState<ShareCardFormat>("square");
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [shareId, setShareId] = useState<string | null>(initialShareId);
  const [publicBusy, setPublicBusy] = useState(false);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const showWatermark = !isPremium;
  const animatedGlow = isPremium;
  const formatSpec = getFormatSpec(format);
  const publicUrl = useMemo(() => buildShareUrl(shareId), [shareId]);

  const previewScale = useMemo(() => {
    const maxW = 320;
    const maxH = 420;
    return Math.min(1, maxW / formatSpec.width, maxH / formatSpec.height);
  }, [formatSpec.width, formatSpec.height]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (open) {
      setIsPublic(initialIsPublic);
      setShareId(initialShareId);
      setError(null);
    }
  }, [open, initialIsPublic, initialShareId]);

  const setPublicSharing = useCallback(
    async (enable: boolean) => {
      setPublicBusy(true);
      setError(null);
      try {
        const res = await fetch(`/api/readings/${readingId}/share`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enable }),
        });
        const json = (await res.json()) as {
          isPublic?: boolean;
          shareId?: string | null;
          publicUrl?: string | null;
          error?: string;
        };
        if (!res.ok) {
          setError(json.error ?? "Could not update sharing");
          return;
        }
        setIsPublic(Boolean(json.isPublic));
        setShareId(json.shareId ?? null);
      } catch {
        setError("Could not update sharing");
      } finally {
        setPublicBusy(false);
      }
    },
    [readingId],
  );

  const handleThemeSelect = (next: ShareCardTheme) => {
    if (!isThemeAllowed(next, isPremium)) {
      setUpgradeOpen(true);
      return;
    }
    setTheme(next);
  };

  const handleDownload = async () => {
    const node = exportRef.current?.firstElementChild as HTMLElement | null;
    if (!node) return;
    setDownloadBusy(true);
    setError(null);
    try {
      await downloadShareCardPng(
        node,
        format,
        isPremium,
        `iching-reading-${format}.png`,
      );
    } catch {
      setError("Download failed — try again");
    } finally {
      setDownloadBusy(false);
    }
  };

  const handleCopyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setError("Could not copy link");
    }
  };

  const handleCopyImage = async () => {
    const node = exportRef.current?.firstElementChild as HTMLElement | null;
    if (!node || !navigator.clipboard?.write) return;
    setDownloadBusy(true);
    try {
      const { exportShareCardPng } = await import("@/lib/share/export-image");
      const dataUrl = await exportShareCardPng(node, format, isPremium);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch {
      setError("Copy image is not supported in this browser");
    } finally {
      setDownloadBusy(false);
    }
  };

  const handleNativeShare = async () => {
    if (!publicUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "I Ching Oracle Reading",
          text: cardData.quote.slice(0, 120),
          url: publicUrl,
        });
        return;
      } catch {
        /* cancelled */
      }
    }
    await handleCopyLink();
  };

  const shareTweet = publicUrl
    ? twitterShareUrl(
        publicUrl,
        `My I Ching reading: ${cardData.question.slice(0, 80)}`,
      )
    : null;

  return (
    <>
      <dialog
        ref={dialogRef}
        onClose={onClose}
        className="w-[calc(100%-1rem)] max-w-2xl rounded-2xl border border-amber-gold/20 bg-zen-surface p-0 text-foreground backdrop:bg-black/80 sm:w-full"
      >
        <div className="relative max-h-[min(92vh,900px)] overflow-y-auto">
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cosmic-purple/25 blur-3xl"
            aria-hidden
          />

          <div className="relative border-b border-white/10 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-amber-gold">
                  Share Reading
                </p>
                <h2 className="mt-1 font-serif text-xl text-foreground">
                  Oracle card
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-zen-muted hover:text-foreground"
                aria-label="Close"
              >
                Close
              </button>
            </div>
          </div>

          <div className="relative space-y-6 p-5 sm:p-6">
            <div className="flex justify-center overflow-hidden rounded-xl border border-white/10 bg-black/40 py-6">
              <div
                style={{
                  width: formatSpec.width * previewScale,
                  height: formatSpec.height * previewScale,
                }}
              >
                <div
                  style={{
                    transform: `scale(${previewScale})`,
                    transformOrigin: "top left",
                    width: formatSpec.width,
                    height: formatSpec.height,
                  }}
                >
                  <ReadingShareCard
                    data={cardData}
                    theme={theme}
                    format={format}
                    showWatermark={showWatermark}
                    animatedGlow={animatedGlow}
                  />
                </div>
              </div>
            </div>

            <div aria-hidden className="pointer-events-none fixed -left-[12000px] top-0">
              <div ref={exportRef}>
                <ReadingShareCard
                  data={cardData}
                  theme={theme}
                  format={format}
                  showWatermark={showWatermark}
                  animatedGlow={false}
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-widest text-zen-muted">
                Theme
              </p>
              <div className="flex flex-wrap gap-2">
                {SHARE_THEMES.map((t) => {
                  const locked = t.premiumOnly && !isPremium;
                  const active = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleThemeSelect(t.id)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        active
                          ? "border-amber-gold/50 bg-amber-gold/15 text-amber-gold"
                          : "border-white/10 text-zen-muted hover:border-white/20"
                      }`}
                    >
                      {t.label}
                      {locked ? " · Premium" : ""}
                    </button>
                  );
                })}
              </div>
              {!isPremium ? (
                <p className="text-xs text-zen-muted">
                  Free: {FREE_SHARE_THEMES.map((id) => getThemeSpec(id).label).join(", ")}. Premium unlocks all themes, HD export, glow, and no watermark.
                </p>
              ) : null}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-widest text-zen-muted">
                Format
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SHARE_FORMATS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                      format === f.id
                        ? "border-amber-gold/40 bg-amber-gold/10 text-amber-gold"
                        : "border-white/10 text-zen-muted hover:border-white/20"
                    }`}
                  >
                    <span className="block font-medium">{f.label}</span>
                    <span className="mt-0.5 block opacity-70">{f.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-zen-bg/50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={isPublic}
                  disabled={publicBusy}
                  onChange={(e) => void setPublicSharing(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm">
                  <span className="font-medium text-foreground">
                    Enable public link
                  </span>
                  <span className="mt-1 block text-xs text-zen-muted">
                    Anyone with the link can view this reading card. Your account details stay private.
                  </span>
                </span>
              </label>
              {isPublic && publicUrl ? (
                <p className="mt-3 break-all font-mono text-xs text-amber-gold/90">
                  {publicUrl}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => void handleDownload()}
                disabled={downloadBusy}
                className="auth-btn-primary text-sm disabled:opacity-50"
              >
                {downloadBusy ? "Exporting…" : "Download PNG"}
              </motion.button>
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                disabled={!isPublic || !publicUrl}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zen-muted hover:border-amber-gold/40 hover:text-amber-gold disabled:opacity-40"
              >
                {copiedLink ? "Link copied" : "Copy link"}
              </button>
              <button
                type="button"
                onClick={() => void handleCopyImage()}
                disabled={downloadBusy}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zen-muted hover:border-amber-gold/40 hover:text-amber-gold"
              >
                {copiedImage ? "Image copied" : "Copy image"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {shareTweet ? (
                <a
                  href={shareTweet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zen-muted hover:border-amber-gold/40 hover:text-amber-gold"
                >
                  X / Twitter
                </a>
              ) : null}
              {publicUrl ? (
                <a
                  href={facebookShareUrl(publicUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zen-muted hover:border-amber-gold/40 hover:text-amber-gold"
                >
                  Facebook
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => void handleNativeShare()}
                disabled={!isPublic || !publicUrl}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zen-muted hover:border-amber-gold/40 hover:text-amber-gold disabled:opacity-40"
              >
                Share…
              </button>
            </div>

            {!isPublic ? (
              <p className="text-xs text-zen-muted">
                Turn on public link to share on social media or copy the URL.
              </p>
            ) : null}

            {!isPremium ? (
              <p className="text-xs text-zen-muted">
                <Link href="/pricing" className="text-amber-gold hover:underline">
                  Upgrade to Premium
                </Link>{" "}
                for all themes, HD export, animated glow, and watermark removal.
              </p>
            ) : null}

            {error ? (
              <p className="text-xs text-red-300" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </dialog>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title="Premium share themes"
        message="Unlock Mystic Purple, Ancient Scroll, HD export, animated glow, and watermark-free cards."
      />
    </>
  );
}
