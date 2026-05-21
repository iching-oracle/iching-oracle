"use client";

import { useState, useTransition } from "react";

type FavoriteButtonProps = {
  readingId: string;
  initialFavorite: boolean;
  className?: string;
  /** Minimal icon-only style for card corners */
  variant?: "default" | "corner";
};

export function FavoriteButton({
  readingId,
  initialFavorite,
  className = "",
  variant = "default",
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isPending, startTransition] = useTransition();

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const next = !isFavorite;
    setIsFavorite(next);

    startTransition(async () => {
      try {
        const res = await fetch("/api/history/favorite", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ readingId }),
        });
        if (!res.ok) {
          setIsFavorite(!next);
          return;
        }
        const data = (await res.json()) as { isFavorite: boolean };
        setIsFavorite(data.isFavorite);
      } catch {
        setIsFavorite(!next);
      }
    });
  }

  const cornerStyles =
    variant === "corner"
      ? isFavorite
        ? "text-amber-glow"
        : "text-zen-muted/70 hover:text-amber-gold"
      : isFavorite
        ? "border-amber-gold/50 bg-amber-gold/20 text-amber-glow shadow-[0_0_16px_-4px_rgba(197,160,89,0.5)]"
        : "border-white/10 bg-zen-elevated/50 text-zen-muted hover:border-amber-gold/30 hover:text-amber-gold";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorite}
      className={`transition-all disabled:opacity-50 ${
        variant === "corner"
          ? `p-1 ${cornerStyles}`
          : `rounded-full border p-2 ${cornerStyles}`
      } ${className}`}
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    </button>
  );
}
