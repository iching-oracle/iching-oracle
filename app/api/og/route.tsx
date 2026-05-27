import { ImageResponse } from "next/og";
import { getHexagram } from "@/lib/hexagrams";
import { getPublicReadingBySlug } from "@/lib/seo/public-reading";
import { SITE_NAME } from "@/lib/seo/site";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") ?? "/";

  let title = SITE_NAME;
  let subtitle = "Ancient wisdom interpreted through modern AI";
  let accent = "☯";

  const hexMatch = path.match(/^\/hexagrams\/(\d+)/);
  const readingMatch = path.match(/^\/reading\/([^/]+)$/);

  if (hexMatch) {
    const hex = getHexagram(parseInt(hexMatch[1]!, 10));
    title = `Hexagram ${hex.number} — ${hex.englishName}`;
    subtitle = hex.judgment.slice(0, 120);
    accent = hex.chineseName;
  } else if (readingMatch) {
    const reading = await getPublicReadingBySlug(readingMatch[1]!);
    if (reading) {
      title = reading.primaryTitle;
      subtitle = reading.summary.slice(0, 120);
      accent = reading.chineseName;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background:
            "linear-gradient(145deg, #0b0c10 0%, #1a1035 50%, #0b0c10 100%)",
          color: "#e8e6e3",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: 14,
              letterSpacing: "0.35em",
              color: "#c5a059",
              textTransform: "uppercase",
            }}
          >
            {SITE_NAME}
          </span>
          <span style={{ fontSize: 44, color: "#e8c97a" }}>{accent}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <p style={{ fontSize: 40, margin: 0, lineHeight: 1.2, color: "#f5f0e6" }}>
            {title.length > 70 ? `${title.slice(0, 67)}…` : title}
          </p>
          <p style={{ fontSize: 22, margin: 0, fontStyle: "italic", color: "#c5a059" }}>
            {subtitle}
          </p>
        </div>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>iching-oracle.com</p>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
