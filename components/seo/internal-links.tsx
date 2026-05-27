import Link from "next/link";
import { getHexagram } from "@/lib/hexagrams";
import type { HexagramTopic } from "@/types/seo";

type InternalLinksProps = {
  title: string;
  links: Array<{ href: string; label: string }>;
};

export function InternalLinks({ title, links }: InternalLinksProps) {
  if (links.length === 0) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-zen-surface/40 p-6">
      <h2 className="text-xs font-medium uppercase tracking-widest text-amber-gold">
        {title}
      </h2>
      <ul className="mt-4 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-zen-muted transition-colors hover:text-amber-gold"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HexagramTopicLinks({ number }: { number: number }) {
  const hex = getHexagram(number);
  const topics: Array<{ topic: HexagramTopic; label: string }> = [
    { topic: "love", label: "Love" },
    { topic: "career", label: "Career" },
    { topic: "spirituality", label: "Spirituality" },
  ];

  return (
    <InternalLinks
      title={`${hex.englishName} by topic`}
      links={[
        { href: `/hexagrams/${number}`, label: "General meaning" },
        ...topics.map((t) => ({
          href: `/hexagrams/${number}/${t.topic}`,
          label: t.label,
        })),
        {
          href: `/guides/what-does-hexagram-${number}-mean`,
          label: `What does Hexagram ${number} mean?`,
        },
      ]}
    />
  );
}

export function RelatedHexagramLinks({ numbers }: { numbers: number[] }) {
  const links = numbers.map((n) => {
    const h = getHexagram(n);
    return { href: `/hexagrams/${n}`, label: `${n}. ${h.title}` };
  });

  return <InternalLinks title="Related hexagrams" links={links} />;
}
