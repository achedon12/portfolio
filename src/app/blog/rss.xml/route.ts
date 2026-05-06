import { getAllPosts } from "@/lib/blog";

export const runtime = "nodejs";
export const revalidate = 60;

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr";
  const posts = await getAllPosts();

  const items = posts
    .map((p) => {
      const url = `${baseUrl}/blog/${p.slug}`;
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(p.description)}</description>
      ${p.tags.map((t) => `<category>${escapeXml(t)}</category>`).join("\n      ")}
    </item>`;
    })
    .join("\n");

  const lastBuild =
    posts.length > 0
      ? new Date(
          Math.max(...posts.map((p) => new Date(p.updatedAt).getTime())),
        ).toUTCString()
      : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Léo Deroin — Carnets de bord</title>
    <link>${baseUrl}/blog</link>
    <description>Articles de Léo Deroin sur le développement web, le shading, Symfony, Next.js et la stack en général.</description>
    <language>fr-FR</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
    },
  });
}
