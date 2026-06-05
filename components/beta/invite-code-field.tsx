"use client";

type InviteCodeFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  autoFocus?: boolean;
  disabled?: boolean;
};

export function InviteCodeField({
  value,
  onChange,
  error,
  autoFocus = false,
  disabled = false,
}: InviteCodeFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="invite-code" className="auth-label">
        Your invitation
      </label>
      <input
        id="invite-code"
        name="inviteCode"
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        autoFocus={autoFocus}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className={`auth-input font-mono tracking-[0.15em] transition-colors ${
          error
            ? "border-red-400/35 bg-red-500/5 focus:border-red-400/50 focus:ring-red-400/15"
            : ""
        }`}
        placeholder="Enter your invitation"
        aria-invalid={Boolean(error)}
        aria-describedby="invite-code-hint"
      />
      {error ? (
        <p
          id="invite-code-hint"
          className="text-xs leading-relaxed text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : (
        <p id="invite-code-hint" className="text-xs leading-relaxed text-zen-muted/80">
          A quiet beta for thoughtful exploration — your personal invitation
          code.
        </p>
      )}
    </div>
  );
}
