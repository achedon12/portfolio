import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Favicon programmatique — généré par next/og.
 * Convention Next : ce fichier remplace `favicon.ico` et est servi à
 * `/icon` + injecté dans `<head>` automatiquement.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #030014 0%, #1e1b4b 100%)",
          color: "#22d3ee",
          fontFamily: "system-ui, sans-serif",
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: -1,
          border: "1px solid rgba(34, 211, 238, 0.4)",
          borderRadius: 6,
        }}
      >
        LD
      </div>
    ),
    { ...size },
  );
}
