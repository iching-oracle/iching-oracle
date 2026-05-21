"use client";

import { INTERPRETATION_MODES } from "@/lib/interpretation/modes";
import type { InterpretationMode } from "@/types/interpretation";

type ToneModeSelectorProps = {
  value: InterpretationMode;
  onChange: (mode: InterpretationMode) => void;
  disabled?: boolean;
};

export function ToneModeSelector({
  value,
  onChange,
  disabled = false,
}: ToneModeSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-widest text-zen-muted">
        Interpretation mode
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {INTERPRETATION_MODES.map((mode) => {
          const active = value === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(mode.id)}
              className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                active
                  ? "border-amber-gold/50 bg-amber-gold/15 shadow-[0_0_24px_-8px_rgba(197,160,89,0.45)]"
                  : "border-white/10 bg-zen-elevated/40 hover:border-amber-gold/25"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span
                className={`block text-sm font-medium ${
                  active ? "text-amber-glow" : "text-foreground"
                }`}
              >
                {mode.label}
              </span>
              <span className="mt-0.5 block text-[10px] leading-snug text-zen-muted">
                {mode.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
