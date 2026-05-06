import { ImageResponse } from "next/og";

export const alt = "Léo Deroin — Développeur Fullstack";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * OG image par défaut, générée à la volée via next/og.
 * Convention Next : ce fichier override l'image par défaut pour toutes
 * les routes qui ne définissent pas leur propre `openGraph.images`.
 *
 * Côté blog, l'override par article (`coverImage` / `ogImage`) prime ;
 * sinon Next sert cette image générée — pas de partage sans visuel.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 96px",
          background: "linear-gradient(135deg, #030014 0%, #0a0420 50%, #1e1b4b 100%)",
          color: "#e2e8f0",
          fontFamily: '"Inter", system-ui, sans-serif',
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-200px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.35) 0%, rgba(34,211,238,0.15) 40%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "20px", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              border: "2px solid #22d3ee",
              background: "rgba(34, 211, 238, 0.1)",
              color: "#22d3ee",
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            LD
          </div>
          <div
            style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: "20px",
              color: "#22d3ee",
              textTransform: "uppercase",
              letterSpacing: "8px",
            }}
          >
            leoderoin.fr
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", zIndex: 1 }}>
          <div
            style={{
              fontSize: "108px",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              background: "linear-gradient(to bottom right, #ffffff, #cbd5e1)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Léo Deroin
          </div>
          <div
            style={{
              fontSize: "52px",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              background: "linear-gradient(to right, #7c3aed, #22d3ee)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Développeur Fullstack
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: "18px",
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "4px",
            zIndex: 1,
          }}
        >
          <span style={{ color: "#22d3ee" }}>◊</span>
          PHP · Symfony · Next.js · React · Vue · Three.js
        </div>
      </div>
    ),
    { ...size },
  );
}
