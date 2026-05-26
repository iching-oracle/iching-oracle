import { ImageResponse } from "next/og";
import { getPublicSharePayload } from "@/lib/share/public-query";

export const alt = "I Ching Oracle Reading";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type OgProps = { params: Promise<{ id: string }> };

export default async function OgImage({ params }: OgProps) {
  const { id } = await params;
  const payload = await getPublicSharePayload(id);

  const title = payload?.data.question ?? "Oracle Reading";
  const quote =
    payload?.data.quote ??
    "Consult the I Ching and share your path with the world.";
  const primary = payload?.data.primaryHexagram;
  const resulting = payload?.data.resultingHexagram;

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
          background: "linear-gradient(135deg, #0b0c10 0%, #1a1035 50%, #0b0c10 100%)",
          color: "#e8e6e3",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              fontSize: 14,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#c5a059",
            }}
          >
            IChing Oracle
          </span>
          <span style={{ fontSize: 36, color: "#e8c97a" }}>☯</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1, justifyContent: "center" }}>
          <p
            style={{
              fontSize: 28,
              color: "#e8c97a",
              margin: 0,
              lineHeight: 1.3,
              maxHeight: 120,
              overflow: "hidden",
            }}
          >
            {title.length > 100 ? `${title.slice(0, 97)}…` : title}
          </p>

          {primary ? (
            <div style={{ display: "flex", gap: 24, fontSize: 18, color: "#9ca3af" }}>
              <span>
                {primary.number}. {primary.title} {primary.chineseName}
              </span>
              {resulting ? (
                <span>
                  → {resulting.number}. {resulting.title}
                </span>
              ) : null}
            </div>
          ) : null}

          <p
            style={{
              fontSize: 22,
              fontStyle: "italic",
              lineHeight: 1.45,
              margin: 0,
              borderLeft: "3px solid rgba(197,160,89,0.5)",
              paddingLeft: 20,
              maxHeight: 200,
              overflow: "hidden",
            }}
          >
            &ldquo;{quote.length > 180 ? `${quote.slice(0, 177)}…` : quote}&rdquo;
          </p>
        </div>

        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
          {payload?.data.dateLabel ?? "iching-oracle.com"}
        </p>
      </div>
    ),
    { ...size },
  );
}
