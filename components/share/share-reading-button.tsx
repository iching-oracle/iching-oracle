"use client";

import { useState } from "react";
import { ShareReadingModal } from "@/components/share/share-reading-modal";
import type { ShareCardReadingData } from "@/types/share";

type ShareReadingButtonProps = {
  readingId: string;
  cardData: ShareCardReadingData;
  isPremium: boolean;
  initialIsPublic: boolean;
  initialShareId: string | null;
};

export function ShareReadingButton({
  readingId,
  cardData,
  isPremium,
  initialIsPublic,
  initialShareId,
}: ShareReadingButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-zen-muted hover:border-amber-gold/40 hover:text-amber-gold"
      >
        Share card
      </button>
      <ShareReadingModal
        open={open}
        onClose={() => setOpen(false)}
        readingId={readingId}
        cardData={cardData}
        isPremium={isPremium}
        initialIsPublic={initialIsPublic}
        initialShareId={initialShareId}
      />
    </>
  );
}
