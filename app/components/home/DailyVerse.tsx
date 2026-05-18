const VERSES = [
  {
    text: "天行健，君子以自強不息。",
    source: "乾 · 象傳",
    gloss: "Heaven moves with vigor — the noble person strengthens without cease.",
  },
  {
    text: "地勢坤，君子以厚德載物。",
    source: "坤 · 象傳",
    gloss: "Earth is receptive — the noble person bears all things with virtue.",
  },
  {
    text: "雲雷屯，君子以經綸。",
    source: "屯 · 象傳",
    gloss: "Cloud and thunder gather — the noble person brings order to beginnings.",
  },
  {
    text: "山下出泉，蒙；君子以果行育德。",
    source: "蒙 · 象傳",
    gloss: "Spring emerges from the mountain — cultivate character through decisive action.",
  },
  {
    text: "雲上於天，需；君子以飲食宴樂。",
    source: "需 · 象傳",
    gloss: "Clouds rise to heaven — wait with patience, then feast in good time.",
  },
  {
    text: "天與水違行，訟；君子以作事謀始。",
    source: "訟 · 象傳",
    gloss: "Heaven and water diverge — plan carefully before you act.",
  },
  {
    text: "地中有水，師；君子以容民畜眾。",
    source: "師 · 象傳",
    gloss: "Water within the earth — lead with discipline and care for the people.",
  },
  {
    text: "風行地上，觀；君子以省方觀民設教。",
    source: "觀 · 象傳",
    gloss: "Wind moves across the earth — observe widely and teach with clarity.",
  },
] as const;

function getDailyVerse() {
  const now = new Date();
  const daySeed =
    now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return VERSES[daySeed % VERSES.length];
}

export function DailyVerse() {
  const verse = getDailyVerse();

  return (
    <footer className="mt-auto pt-8">
      <div className="relative mx-auto max-w-2xl">
        <div
          className="absolute -inset-px rounded-lg bg-gradient-to-r from-amber-gold/30 via-amber-gold/10 to-amber-gold/30 opacity-50 blur-[1px]"
          aria-hidden
        />
        <VerseCard verse={verse} />
      </div>
      <p className="mt-10 text-center text-xs text-zen-muted/60">
        © {new Date().getFullYear()} ICHING-ORACLE · 易經占卜
      </p>
    </footer>
  );
}

function VerseCard({
  verse,
}: {
  verse: (typeof VERSES)[number];
}) {
  return (
    <div className="relative rounded-lg border border-white/[0.08] bg-zen-surface/90 px-8 py-10 shadow-[inset_0_1px_0_rgba(197,160,89,0.1)] backdrop-blur-md transition-all duration-500 hover:border-amber-gold/35 hover:shadow-[0_0_40px_-12px_rgba(197,160,89,0.35)]">
      <p className="mb-1 text-center text-[10px] font-medium uppercase tracking-[0.4em] text-zen-muted">
        Daily Verse
      </p>
      <p className="mb-6 text-center font-serif text-sm tracking-widest text-amber-gold/80">
        每日一語
      </p>

      <blockquote className="text-center font-serif text-2xl leading-relaxed text-foreground sm:text-3xl">
        「{verse.text}」
      </blockquote>
      <p className="mt-4 text-center text-xs uppercase tracking-widest text-zen-muted">
        {verse.source}
      </p>
      <p className="mt-3 text-center text-sm italic leading-relaxed text-zen-muted/90">
        {verse.gloss}
      </p>

      <div className="mt-8 flex justify-center">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-gold/50 to-transparent" />
      </div>
    </div>
  );
}
