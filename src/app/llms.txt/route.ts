import { profile } from "@/lib/profile";
import { getAllPosts } from "@/lib/blog";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
// Force dynamic : le `next build` Docker s'exécute sans DB joignable et
// figerait un manifeste vide. On recalcule à chaque requête (volume négligeable).
export const dynamic = "force-dynamic";

/**
 * llms.txt — convention informelle (Jeremy Howard, sept. 2024) qui propose
 * un manifeste Markdown structuré pour aider les LLMs à indexer et résumer
 * un site sans devoir parser tout le HTML/JS.
 *
 * Format : https://llmstxt.org/
 *  - H1 : nom du site
 *  - blockquote : description courte
 *  - sections H2 avec liens annotés
 */
export async function GET() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr";

  let posts: Awaited<ReturnType<typeof getAllPosts>> = [];
  let projects: Array<{ slug: string; title: string; description: string; category: string }> = [];

  try {
    [posts, projects] = await Promise.all([
      getAllPosts(),
      prisma.project.findMany({
        where: { published: true },
        select: { slug: true, title: true, description: true, category: true },
        orderBy: { publishedAt: "desc" },
      }),
    ]);
  } catch {
    // Continue avec listes vides si DB indispo (build offline).
  }

  const projectLines = projects
    .slice(0, 12)
    .map((p) => `- [${p.title}](${base}/projects/${p.slug}) — ${p.description}`)
    .join("\n");

  const postLines = posts
    .slice(0, 20)
    .map((p) => `- [${p.title}](${base}/blog/${p.slug}) — ${p.description}`)
    .join("\n");

  const body = `# ${profile.name} — Développeur Fullstack à Lyon

> ${profile.bio[0]} Stack principale : Next.js, React, Symfony, Phalcon, Vue.js, TypeScript, MySQL, Three.js. En alternance chez Confluent Digital. Site bilingue FR (par défaut) et EN (préfixe /en).

## Identité
- Nom : ${profile.name}
- Rôle : ${profile.role}
- Localisation : ${profile.location} (${profile.address.region}, ${profile.address.country})
- Email : ${profile.email}
- GitHub : ${profile.links.github}
- LinkedIn : ${profile.links.linkedin}

## Pages principales
- [Accueil / Home](${base}/) — Présentation, Hero, About, compétences, parcours, contact
- [Projets / Projects](${base}/projects) — Galerie filtrable par catégorie et stack
- [Blog / Carnets de bord](${base}/blog) — Articles techniques (FR par défaut)
- [Setup / /uses](${base}/uses) — Hardware, éditeur, stack par défaut
- [Lab / R3F demos](${base}/lab) — 3 démos Three.js interactives (planète procédurale, bruit fbm, particules attractives)
- [/now](${base}/now) — Activités du moment

## Compétences principales
${profile.knowsAbout.map((k) => `- ${k}`).join("\n")}

## Projets récents
${projectLines || "- (Aucun projet exposé via l'API au moment de la génération.)"}

## Articles récents
${postLines || "- (Aucun article exposé via l'API au moment de la génération.)"}

## Documents
- [CV PDF](${base}/cv) — CV à télécharger (route courte qui redirige vers le fichier)

## Flux et métadonnées
- [Sitemap](${base}/sitemap.xml)
- [RSS articles](${base}/blog/rss.xml)
- [Robots](${base}/robots.txt)
- [Manifest PWA](${base}/manifest.webmanifest)

## Contact direct
Le formulaire de contact public est sur la home (section #contact). Réponse sous 24-48h.
Pour les freelances : ${profile.links.malt}
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
