"use client";

type StreamingTextProps = {
  content: string;
  isStreaming?: boolean;
  className?: string;
};

export function StreamingText({
  content,
  isStreaming = false,
  className = "",
}: StreamingTextProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
        {content}
        {isStreaming ? (
          <span
            className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-amber-gold align-middle"
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
}
