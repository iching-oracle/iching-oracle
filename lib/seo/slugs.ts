import { getHexagram } from "@/lib/hexagrams";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function hexagramBaseSlug(number: number): string {
  const hex = getHexagram(number);
  const name = slugify(hex.englishName);
  return `hexagram-${number}-${name}`;
}

export function hexagramTopicSlug(number: number, topic: string): string {
  return `${hexagramBaseSlug(number)}-${topic}`;
}

export function readingPublicSlug(input: {
  hexagram: number;
  question: string;
  category?: string;
}): string {
  const hex = getHexagram(input.hexagram);
  const hexPart = hexagramBaseSlug(input.hexagram);
  const q = slugify(input.question);
  if (q.length >= 8) {
    return `${hexPart}-${q}`.slice(0, 120);
  }
  const cat = input.category ? slugify(input.category) : "guidance";
  return `${hexPart}-${cat}-reading`;
}

/** Private reading IDs are CUIDs; public SEO slugs use hyphens and words. */
export function isPrivateReadingId(segment: string): boolean {
  return /^c[a-z0-9]{20,}$/i.test(segment);
}

export function isValidHexagramNumber(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= 64;
}
