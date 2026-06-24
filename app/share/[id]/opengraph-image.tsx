import { ImageResponse } from "next/og";
import { getPublicSharePayload } from "@/lib/share/public-query";

export const alt = "I Ching Oracle Reading";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type OgProps = { params: Promise<{ id: string }> };

export default async function OgImage({ params }: OgProps) {
  const { id } = await params;
  const reading = await getPublicSharePayload(id);

  const hexNumber = reading?.hexagramNumber ?? "—";
  const hexName = reading?.hexagramName ?? "Oracle Reading";
  const question = reading?.question ?? "A reading shared from I Ching Oracle";

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
          background: "linear-gradient(145deg, #0b0c10 0%, #1a1035 45%, #0b0c10 100%)",
          color: "#e8e6e3",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 13,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#c5a059",
            }}
          >
            I Ching Oracle
          </span>
          <span style={{ fontSize: 32, color: "#e8c97a" }}>☯</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            flex: 1,
            justifyContent: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 22,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#8b7ec8",
            }}
          >
            Hexagram {hexNumber}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 44,
              fontWeight: 600,
              color: "#e8c97a",
              lineHeight: 1.15,
            }}
          >
            {hexName}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 20,
              lineHeight: 1.45,
              color: "#b8b4c4",
              borderLeft: "3px solid rgba(197,160,89,0.45)",
              paddingLeft: 20,
              maxHeight: 160,
              overflow: "hidden",
            }}
          >
            {question.length > 140 ? `${question.slice(0, 137)}…` : question}
          </p>
        </div>

        <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
          ichingoracle.de
        </p>
      </div>
    ),
    { ...size },
  );
}
