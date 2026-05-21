"use client";

type SuggestionChipsProps = {
  suggestions: readonly string[];
  onSelect: (text: string) => void;
  disabled?: boolean;
};

export function SuggestionChips({
  suggestions,
  onSelect,
  disabled = false,
}: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((text) => (
        <button
          key={text}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(text)}
          className="rounded-full border border-white/10 bg-zen-elevated/50 px-3 py-1.5 text-left text-xs text-zen-muted transition-all hover:border-amber-gold/35 hover:text-amber-glow disabled:opacity-40"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
