/** Lightweight lexical similarity for merge/dedup without embeddings. */

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff\s]/gi, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );
}

export function similarityScore(a: string, b: string): number {
  const ta = tokenize(a);
  const tb = tokenize(b);
  if (ta.size === 0 || tb.size === 0) return 0;

  let overlap = 0;
  for (const t of ta) {
    if (tb.has(t)) overlap += 1;
  }

  return overlap / Math.max(ta.size, tb.size);
}

export function areMemoriesSimilar(
  a: { summary: string; type: string },
  b: { summary: string; type: string },
  threshold = 0.45,
): boolean {
  if (a.type !== b.type) return false;
  return similarityScore(a.summary, b.summary) >= threshold;
}
