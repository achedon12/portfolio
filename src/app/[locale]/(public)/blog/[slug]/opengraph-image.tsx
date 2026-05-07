import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Léo Deroin — Carnet de bord";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const sliced = text.slice(0, max - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? sliced.slice(0, lastSpace) : sliced) + "…";
}

export default async function OgImage({ params }: Props) {
  const { locale, slug } = await params;
  const isFr = locale === "fr";
  const post = await getPostBySlug(slug);

  const fallbackTitle = isFr ? "Article — Léo Deroin" : "Article — Léo Deroin";
  const title = truncate(post?.title ?? fallbackTitle, 90);
  const description = truncate(post?.description ?? "", 130);
  const tags = (post?.tags ?? []).slice(0, 3);
  const readingTime = post?.readingTime ?? 0;
  const kicker = isFr ? "◊ Carnet de bord — leoderoin.fr" : "◊ Logbook — leoderoin.fr";
  const minutesLabel = isFr ? "min de lecture" : "min read";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #030014 0%, #1e1b4b 60%, #0a0420 100%)",
          padding: 72,
          fontFamily: "system-ui, sans-serif",
          color: "#e2e8f0",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -100,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(34,211,238,0.28) 0%, rgba(34,211,238,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -120,
            width: 600,
            height: 600,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(124,58,237,0.30) 0%, rgba(124,58,237,0) 70%)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            fontFamily: "monospace",
            fontSize: 22,
            textTransform: "uppercase",
            letterSpacing: 6,
            color: "#22d3ee",
          }}
        >
          {kicker}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: title.length > 60 ? 56 : 68,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: -1.5,
            color: "#f1f5f9",
          }}
        >
          {title}
        </div>

        {description ? (
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 24,
              lineHeight: 1.4,
              color: "#94a3b8",
            }}
          >
            {description}
          </div>
        ) : null}

        <div style={{ flex: 1, display: "flex" }} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  fontFamily: "monospace",
                  fontSize: 18,
                  padding: "8px 16px",
                  borderRadius: 9999,
                  border: "1px solid rgba(34, 211, 238, 0.4)",
                  background: "rgba(34, 211, 238, 0.08)",
                  color: "#22d3ee",
                }}
              >
                {tag}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {readingTime > 0 ? (
              <div
                style={{
                  display: "flex",
                  fontFamily: "monospace",
                  fontSize: 18,
                  color: "#64748b",
                }}
              >
                {readingTime} {minutesLabel}
              </div>
            ) : null}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 72,
                height: 72,
                borderRadius: 18,
                border: "2px solid rgba(34, 211, 238, 0.55)",
                background: "rgba(34, 211, 238, 0.10)",
                color: "#22d3ee",
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: -2,
              }}
            >
              LD
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
