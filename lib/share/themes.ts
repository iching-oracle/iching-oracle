import type { ShareCardTheme } from "@/types/share";

export type ShareThemeSpec = {
  id: ShareCardTheme;
  label: string;
  premiumOnly: boolean;
  container: string;
  accent: string;
  muted: string;
  quote: string;
  border: string;
  glow: string;
  symbol: string;
};

export const SHARE_THEMES: ShareThemeSpec[] = [
  {
    id: "midnight-gold",
    label: "Midnight Gold",
    premiumOnly: false,
    container:
      "bg-[#0b0c10] text-[#e8e6e3] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.12),transparent_55%)]",
    accent: "text-[#e8c97a]",
    muted: "text-[#8b8d94]",
    quote: "text-[#e8e6e3]",
    border: "border-[rgba(197,160,89,0.35)]",
    glow: "shadow-[0_0_60px_-12px_rgba(197,160,89,0.45)]",
    symbol: "text-[#c5a059]",
  },
  {
    id: "mystic-purple",
    label: "Mystic Purple",
    premiumOnly: true,
    container:
      "bg-gradient-to-br from-[#1a1035] via-[#12141c] to-[#0b0c10] text-[#e8e6e3] bg-[radial-gradient(ellipse_at_bottom,rgba(124,58,237,0.25),transparent_60%)]",
    accent: "text-[#a78bfa]",
    muted: "text-[#9ca3af]",
    quote: "text-[#f3f0ff]",
    border: "border-[rgba(167,139,250,0.35)]",
    glow: "shadow-[0_0_70px_-15px_rgba(124,58,237,0.55)]",
    symbol: "text-[#c4b5fd]",
  },
  {
    id: "minimal-light",
    label: "Minimal Light",
    premiumOnly: false,
    container: "bg-[#f7f4ef] text-[#1a1d28]",
    accent: "text-[#8b6914]",
    muted: "text-[#6b7280]",
    quote: "text-[#1f2937]",
    border: "border-[rgba(139,105,20,0.25)]",
    glow: "shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)]",
    symbol: "text-[#c5a059]",
  },
  {
    id: "ancient-scroll",
    label: "Ancient Scroll",
    premiumOnly: true,
    container:
      "bg-gradient-to-b from-[#2a2318] via-[#1f1a14] to-[#14110d] text-[#efe8dc] bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.08),transparent_70%)]",
    accent: "text-[#d4b896]",
    muted: "text-[#a89880]",
    quote: "text-[#f5efe6]",
    border: "border-[rgba(212,184,150,0.35)]",
    glow: "shadow-[0_0_50px_-12px_rgba(180,140,90,0.35)]",
    symbol: "text-[#c5a059]",
  },
];

export const FREE_SHARE_THEMES: ShareCardTheme[] = [
  "midnight-gold",
  "minimal-light",
];

export function getThemeSpec(theme: ShareCardTheme): ShareThemeSpec {
  return SHARE_THEMES.find((t) => t.id === theme) ?? SHARE_THEMES[0]!;
}

export function isThemeAllowed(
  theme: ShareCardTheme,
  isPremium: boolean,
): boolean {
  const spec = getThemeSpec(theme);
  if (!spec.premiumOnly) return true;
  return isPremium;
}
