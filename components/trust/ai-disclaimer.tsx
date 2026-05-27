import {
  AI_DISCLAIMER_MEDIUM,
  AI_DISCLAIMER_SHORT,
} from "@/lib/trust/messages";

type AiDisclaimerProps = {
  variant?: "short" | "medium";
  className?: string;
};

export function AiDisclaimer({
  variant = "short",
  className = "",
}: AiDisclaimerProps) {
  const text = variant === "medium" ? AI_DISCLAIMER_MEDIUM : AI_DISCLAIMER_SHORT;

  return (
    <p
      className={`text-xs leading-relaxed text-zen-muted ${className}`}
      role="note"
    >
      {text}{" "}
      <a href="/trust/ai" className="text-amber-gold/90 hover:underline">
        How AI works
      </a>
    </p>
  );
}
