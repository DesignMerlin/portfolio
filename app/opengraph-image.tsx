import { ImageResponse } from "next/og";

export const alt = "Samuel Ekwenze, product designer and design engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#f2f3f5",
          backgroundImage: "radial-gradient(rgba(17,19,24,0.12) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
          color: "#111318",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#565b66" }}>Samuel Ekwenze, Lagos</div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1.02 }}>
          <span>Designing products people trust,</span>
          <span style={{ color: "#8a8f99" }}>for 3+ years.</span>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#4b37d6" }}>Product designer and design engineer</div>
      </div>
    ),
    size,
  );
}
