import type { PostMeta } from "@/lib/blog";

/**
 * Sélectionne les articles les plus proches du post courant en fonction
 * du chevauchement de tags.
 *
 * Scoring :
 *   score = (tags partagés) * 10 + (récence en jours, plus récent = plus haut)
 *
 * Le poids des tags domine : un article qui partage 2 tags sera toujours
 * devant un article qui en partage 1, même s'il est plus vieux.
 */
export function getRelatedPosts(
  currentSlug: string,
  allPosts: PostMeta[],
  limit = 3,
): PostMeta[] {
  const current = allPosts.find((p) => p.slug === currentSlug);
  if (!current) return [];

  const currentTags = new Set(current.tags ?? []);
  if (currentTags.size === 0) return [];

  const now = Date.now();

  const scored = allPosts
    .filter((p) => p.slug !== currentSlug)
    .map((p) => {
      const sharedTags = (p.tags ?? []).filter((t) => currentTags.has(t)).length;
      if (sharedTags === 0) return null;
      const ageDays = Math.max(
        0,
        (now - new Date(p.publishedAt).getTime()) / (1000 * 60 * 60 * 24),
      );
      // Recency bonus capped : 365j = 0pt, today = 1pt
      const recencyBonus = Math.max(0, 1 - ageDays / 365);
      return { post: p, score: sharedTags * 10 + recencyBonus };
    })
    .filter((x): x is { post: PostMeta; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.post);

  return scored;
}
