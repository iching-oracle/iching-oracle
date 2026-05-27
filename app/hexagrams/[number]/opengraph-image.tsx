import { ImageResponse } from "next/og";
import { getHexagram } from "@/lib/hexagrams";
import { isValidHexagramNumber } from "@/lib/seo/slugs";

export const alt = "I Ching Hexagram";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type OgProps = { params: Promise<{ number: string }> };

export default async function HexagramOgImage({ params }: OgProps) {
  const { number: raw } = await params;
  const number = parseInt(raw, 10);
  const hex = isValidHexagramNumber(number)
    ? getHexagram(number)
    : getHexagram(1);

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
            "linear-gradient(145deg, #0b0c10 0%, #1a1035 45%, #0b0c10 100%)",
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
            I Ching Oracle
          </span>
          <span style={{ fontSize: 48, color: "#e8c97a" }}>{hex.chineseName}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 22, color: "#9ca3af", margin: 0 }}>
            Hexagram {hex.number}
          </p>
          <p style={{ fontSize: 42, color: "#f5f0e6", margin: 0, lineHeight: 1.2 }}>
            {hex.englishName}
          </p>
          <p
            style={{
              fontSize: 20,
              fontStyle: "italic",
              color: "#c5a059",
              margin: 0,
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            {hex.judgment.length > 140
              ? `${hex.judgment.slice(0, 137)}…`
              : hex.judgment}
          </p>
        </div>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
          iching-oracle.com
        </p>
      </div>
    ),
    { ...size },
  );
}
