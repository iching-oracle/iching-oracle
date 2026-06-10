type IconProps = { className?: string };

export function QuestionIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 4.5 1.5c0 2-2.5 2-2.5 4" strokeLinecap="round" />
      <circle cx="12" cy="17.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CastIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="4" width="14" height="2.5" rx="1.25" fill="currentColor" opacity="0.9" />
      <rect x="6" y="9" width="5" height="2.5" rx="1.25" fill="currentColor" opacity="0.7" />
      <rect x="13" y="9" width="5" height="2.5" rx="1.25" fill="currentColor" opacity="0.7" />
      <rect x="5" y="14" width="14" height="2.5" rx="1.25" fill="currentColor" opacity="0.9" />
      <rect x="6" y="19" width="5" height="2.5" rx="1.25" fill="currentColor" opacity="0.7" />
      <rect x="13" y="19" width="5" height="2.5" rx="1.25" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function InsightIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        d="M12 3v2M5.6 5.6l1.4 1.4M3 12h2M5.6 18.4l1.4-1.4M12 19v2M18.4 18.4l-1.4-1.4M19 12h2M18.4 5.6l-1.4 1.4"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

export function HexagramsIcon({ className = "h-6 w-6" }: IconProps) {
  return <CastIcon className={className} />;
}

export function AiIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M8 12h8M12 8v8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="17" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="17" cy="16" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
      <circle cx="7" cy="16" r="1" fill="currentColor" stroke="none" />
      <circle cx="7" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ShieldIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GuidanceIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M12 3c-4 4-6 7-6 10a6 6 0 0 0 12 0c0-3-2-6-6-10z" strokeLinejoin="round" />
      <circle cx="12" cy="14" r="2" />
    </svg>
  );
}
