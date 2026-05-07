import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// Maskable icon — design stays inside the safe zone (40% radius from center)
// so Android adaptive icon masks (circle, squircle…) never clip the LD mark.
export default function Icon512() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #030014 0%, #1e1b4b 60%, #0a0420 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 360,
            height: 360,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.55) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 280,
            height: 280,
            borderRadius: 64,
            border: "6px solid rgba(34, 211, 238, 0.55)",
            background: "rgba(34, 211, 238, 0.08)",
            color: "#22d3ee",
            fontFamily: "system-ui, sans-serif",
            fontSize: 144,
            fontWeight: 800,
            letterSpacing: -8,
            zIndex: 1,
          }}
        >
          LD
        </div>
      </div>
    ),
    { ...size },
  );
}
