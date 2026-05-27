type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zen-surface/50 p-5">
      <p className="text-[10px] uppercase tracking-widest text-zen-muted">{label}</p>
      <p className="mt-2 font-serif text-3xl text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zen-muted">{hint}</p> : null}
    </div>
  );
}
