export function LandingSectionDivider() {
  return (
    <div
      className="mx-auto my-6 flex max-w-md items-center justify-center gap-4 sm:my-10"
      aria-hidden
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-gold/20" />
      <span className="flex flex-col items-center gap-1 opacity-50" aria-hidden>
        <span className="h-px w-4 rounded-full bg-amber-gold/60" />
        <span className="flex gap-1">
          <span className="h-px w-1.5 rounded-full bg-amber-gold/40" />
          <span className="h-px w-1.5 rounded-full bg-amber-gold/40" />
        </span>
        <span className="h-px w-4 rounded-full bg-amber-gold/60" />
      </span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-gold/20" />
    </div>
  );
}
