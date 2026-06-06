import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title   = searchParams.get("title")   ?? "AI-Powered Insurance Submission Platform";
  const subtitle = searchParams.get("subtitle") ?? "For Lloyd's MGAs and coverholders";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "#080d18",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {/* Grid mesh background */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(79,110,247,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(79,110,247,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          display: "flex",
        }} />
        {/* Glow */}
        <div style={{
          position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 400, borderRadius: "50%",
          background: "rgba(79,110,247,0.15)", filter: "blur(80px)",
          display: "flex",
        }} />

        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          marginBottom: 40,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "#4f6ef7",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24,
          }}>⚡</div>
          <span style={{ color: "#fff", fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px" }}>
            Velox AI
          </span>
        </div>

        {/* Title */}
        <div style={{
          fontSize: 52, fontWeight: 800, color: "#fff",
          textAlign: "center", lineHeight: 1.1,
          maxWidth: 900, padding: "0 60px",
          letterSpacing: "-1px",
          display: "flex", flexWrap: "wrap", justifyContent: "center",
        }}>
          {title}
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 22, color: "#94a3b8", marginTop: 20,
          textAlign: "center",
          display: "flex",
        }}>
          {subtitle}
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex", gap: 40, marginTop: 48,
          padding: "16px 40px", borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          {[
            ["8 min", "avg decision"],
            ["91%",   "AI accuracy"],
            ["£46B",  "market addressed"],
          ].map(([v, l]) => (
            <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#4f6ef7" }}>{v}</span>
              <span style={{ fontSize: 14, color: "#64748b" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
