import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon (180x180) — affichée quand un utilisateur iOS ajoute
 * le site à son écran d'accueil. Convention Next.
 */
export default function AppleIcon() {
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
          color: "#22d3ee",
          fontFamily: "system-ui, sans-serif",
          fontSize: 88,
          fontWeight: 800,
          letterSpacing: -4,
          border: "4px solid rgba(34, 211, 238, 0.5)",
          borderRadius: 36,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 160,
            height: 160,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.45) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <span style={{ position: "relative", display: "flex", zIndex: 1 }}>LD</span>
      </div>
    ),
    { ...size },
  );
}
