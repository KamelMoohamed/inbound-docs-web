import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION } from "@/lib/seo";

export const alt = "CliniDoc — clinical document triage for Australian practices";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand-coloured social card. Rendered at build/request time via next/og.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #eef2ff 0%, #ffffff 55%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* Simple document-with-check glyph echoing the brand icon. */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "96px",
              height: "96px",
              borderRadius: "20px",
              background: "#4f46e5",
            }}
          >
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: "84px", fontWeight: 800, letterSpacing: "-2px" }}>
            <span style={{ color: "#0f172a" }}>Clini</span>
            <span style={{ color: "#4f46e5" }}>Doc</span>
          </div>
        </div>
        <div
          style={{
            marginTop: "40px",
            fontSize: "40px",
            lineHeight: 1.25,
            color: "#334155",
            maxWidth: "900px",
          }}
        >
          {SITE_DESCRIPTION}
        </div>
        <div style={{ marginTop: "48px", fontSize: "28px", color: "#64748b", fontWeight: 600 }}>
          Hosted in Australia · Encrypted · Human-in-the-loop
        </div>
      </div>
    ),
    { ...size },
  );
}
