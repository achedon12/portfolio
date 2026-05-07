import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getAllPosts } from "@/lib/blog";
import { routing } from "@/i18n/routing";

// Force dynamic : le `next build` Docker s'exécute sans DB joignable et
// retournerait un sitemap statique vide. En recalculant à chaque requête
// on s'assure que projets/articles publiés y figurent toujours.
export const dynamic = "force-dynamic";

/**
 * Sitemap multi-locale.
 *
 * Pour chaque page on émet une seule entrée par URL canonique
 * (FR à la racine, EN sous `/en`) et on déclare les alternates `hreflang`
 * via le champ `alternates.languages` que Next inline dans le XML.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr";

  // Tolérance build offline : si la DB n'est pas joignable, on génère le
  // sitemap sans les routes dynamiques. Prochaine régénération ISR au runtime.
  let projects: Array<{ slug: string; updatedAt: Date }>;
  let posts: Awaited<ReturnType<typeof getAllPosts>>;
  try {
    [projects, posts] = await Promise.all([
      prisma.project.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      getAllPosts(),
    ]);
  } catch (e) {
    console.warn("[sitemap] DB unreachable, emitting static routes only", e instanceof Error ? e.message : e);
    projects = [];
    posts = [];
  }

  const localizedUrl = (path: string, locale: string) =>
    locale === routing.defaultLocale ? `${base}${path}` : `${base}/${locale}${path}`;

  /** Build a sitemap entry with hreflang alternates for each locale. */
  const entry = (
    path: string,
    opts: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
  ): MetadataRoute.Sitemap => {
    const languages: Record<string, string> = {};
    routing.locales.forEach((l) => {
      languages[l] = localizedUrl(path, l);
    });
    languages["x-default"] = localizedUrl(path, routing.defaultLocale);
    return routing.locales.map((l) => ({
      ...opts,
      url: localizedUrl(path, l),
      alternates: { languages },
    }));
  };

  return [
    ...entry("/", { changeFrequency: "weekly", priority: 1 }),
    ...entry("/projects", { changeFrequency: "weekly", priority: 0.8 }),
    ...entry("/blog", { changeFrequency: "weekly", priority: 0.8 }),
    ...entry("/uses", { changeFrequency: "monthly", priority: 0.5 }),
    ...entry("/now", { changeFrequency: "weekly", priority: 0.6 }),
    ...entry("/lab", { changeFrequency: "monthly", priority: 0.4 }),
    ...entry("/newsletter", { changeFrequency: "yearly", priority: 0.3 }),
    ...projects.flatMap((p) =>
      entry(`/projects/${p.slug}`, {
        lastModified: p.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      }),
    ),
    ...posts.flatMap((p) =>
      entry(`/blog/${p.slug}`, {
        lastModified: new Date(p.updatedAt),
        changeFrequency: "monthly",
        priority: 0.5,
      }),
    ),
  ];
}
