import type { ShareCardFormat } from "@/types/share";

export type ShareFormatSpec = {
  id: ShareCardFormat;
  label: string;
  width: number;
  height: number;
  description: string;
};

export const SHARE_FORMATS: ShareFormatSpec[] = [
  {
    id: "square",
    label: "Square",
    width: 1080,
    height: 1080,
    description: "Instagram post",
  },
  {
    id: "story",
    label: "Story",
    width: 1080,
    height: 1920,
    description: "Stories / Reels",
  },
  {
    id: "landscape",
    label: "Landscape",
    width: 1200,
    height: 630,
    description: "Twitter / link preview",
  },
  {
    id: "wallpaper",
    label: "Wallpaper",
    width: 1080,
    height: 1920,
    description: "Mobile lock screen",
  },
];

export function getFormatSpec(format: ShareCardFormat): ShareFormatSpec {
  return SHARE_FORMATS.find((f) => f.id === format) ?? SHARE_FORMATS[0]!;
}
