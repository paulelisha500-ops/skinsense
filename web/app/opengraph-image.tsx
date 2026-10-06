import { ImageResponse } from "next/og";

export const alt = "SkinSense — Understand your skin. Then actually improve it.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Required for the static export (STATIC_EXPORT=1); harmless on Vercel.
export const dynamic = "force-static";

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96" fill="none"><defs><linearGradient id="g" x1="10" y1="8" x2="38" y2="42" gradientUnits="userSpaceOnUse"><stop stop-color="#E6C9A3"/><stop offset="1" stop-color="#B07A4A"/></linearGradient></defs><circle cx="24" cy="24" r="21.2" stroke="#F3E8DA" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="88 22"/><path d="M24 9.5c6.4 4.6 10.6 10.2 10.6 15.6 0 6-4.7 10.4-10.6 10.4S13.4 31.1 13.4 25.1c0-5.4 4.2-11 10.6-15.6z" fill="url(#g)"/><path d="M24 15.5v15.8" stroke="#3B2A20" stroke-width="1.5" stroke-linecap="round"/><path d="M24 22.6l4.4-3.6M24 27.4l-4.4-3.6" stroke="#3B2A20" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export default function OpengraphImage() {
  const mark = `data:image/svg+xml;base64,${Buffer.from(MARK).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#3B2A20",
          color: "#FAF5EE",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -300,
            right: -220,
            width: 820,
            height: 820,
            borderRadius: 9999,
            display: "flex",
            background: "radial-gradient(circle, rgba(176,122,74,0.55) 0%, rgba(176,122,74,0) 68%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -320,
            left: -240,
            width: 760,
            height: 760,
            borderRadius: 9999,
            display: "flex",
            background: "radial-gradient(circle, rgba(90,62,43,0.95) 0%, rgba(90,62,43,0) 70%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "64px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mark} width={78} height={78} alt="" />
            <div style={{ display: "flex", fontSize: 46, letterSpacing: -1.5 }}>
              <span>Skin</span>
              <span style={{ color: "#C8A27C" }}>Sense</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 80, lineHeight: 1.04, letterSpacing: -3.5 }}>
              Understand your skin.
            </div>
            <div style={{ display: "flex", fontSize: 80, lineHeight: 1.04, letterSpacing: -3.5, color: "#C8A27C" }}>
              Then actually improve it.
            </div>
            <div style={{ display: "flex", marginTop: 30, fontSize: 28, color: "rgba(243,232,218,0.85)" }}>
              Free AI skin screening · 7 conditions · Morning + evening routines
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 21,
              color: "rgba(243,232,218,0.66)",
              borderTop: "1px solid rgba(243,232,218,0.16)",
              paddingTop: 22,
            }}
          >
            <span>Educational screening, not a diagnosis.</span>
            <span>30-day guided plan · 100% free</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
