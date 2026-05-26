"use client";

import { toPng } from "html-to-image";
import { getFormatSpec } from "@/lib/share/formats";
import type { ShareCardFormat } from "@/types/share";

export async function exportShareCardPng(
  node: HTMLElement,
  format: ShareCardFormat,
  isPremium: boolean,
): Promise<string> {
  const spec = getFormatSpec(format);
  await document.fonts.ready;

  return toPng(node, {
    width: spec.width,
    height: spec.height,
    pixelRatio: isPremium ? 3 : 2,
    cacheBust: true,
    skipAutoScale: false,
  });
}

export async function downloadShareCardPng(
  node: HTMLElement,
  format: ShareCardFormat,
  isPremium: boolean,
  filename: string,
): Promise<void> {
  const dataUrl = await exportShareCardPng(node, format, isPremium);
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
