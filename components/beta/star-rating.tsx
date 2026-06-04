"use client";

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  label?: string;
};

export function StarRating({ value, onChange, label = "Rating" }: StarRatingProps) {
  return (
    <div role="group" aria-label={label}>
      <p className="mb-2 text-xs text-zen-muted">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`h-10 w-10 rounded-lg text-lg transition-colors ${
              star <= value
                ? "bg-amber-gold/20 text-amber-gold"
                : "bg-zen-elevated/60 text-zen-muted hover:text-amber-gold/70"
            }`}
            aria-label={`${star} out of 5`}
            aria-pressed={star <= value}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}
