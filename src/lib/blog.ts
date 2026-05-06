import GithubSlugger from "github-slugger";
import { prisma } from "@/lib/prisma";

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  /** ISO 8601, vient de publishedAt en DB */
  publishedAt: string;
  /** ISO 8601, dernière modification — utilisé par le sitemap. */
  updatedAt: string;
  tags: string[];
  readingTime: number;
  wordCount: number;
  coverImage: string | null;
}

export interface Post extends PostMeta {
  content: string;
  toc: TocEntry[];

  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;

  viewCount: number;
  likeCount: number;
  commentsEnabled: boolean;

  updatedAt: string;
}

export interface TocEntry {
  id: string;
  text: string;
  depth: 2 | 3;
}

const WORDS_PER_MINUTE = 200;

function readingTime(text: string): { minutes: number; words: number } {
  const words = text.replace(/```[\s\S]*?```/g, "").trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  return { minutes, words };
}

/**
 * Extrait les headings ## et ### du MDX brut pour la TOC.
 * Ignore les `## ...` à l'intérieur de blocs de code.
 */
function extractToc(raw: string): TocEntry[] {
  const noCode = raw.replace(/```[\s\S]*?```/g, "");
  const slugger = new GithubSlugger();
  const out: TocEntry[] = [];
  for (const line of noCode.split("\n")) {
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const depth = m[1].length as 2 | 3;
    const text = m[2].trim();
    out.push({ id: slugger.slug(text), text, depth });
  }
  return out;
}

function tagsArray(json: unknown): string[] {
  return Array.isArray(json) ? json.filter((t): t is string => typeof t === "string") : [];
}

export async function getAllPosts(): Promise<PostMeta[]> {
  // Tolérance au build offline (Docker prod) : si la DB n'est pas joignable,
  // on retourne []. Le runtime régénère via ISR (revalidate=60) au premier hit.
  let posts;
  try {
    posts = await prisma.blogPost.findMany({
      where: { published: true, publishedAt: { not: null, lte: new Date() } },
      orderBy: { publishedAt: "desc" },
    });
  } catch (e) {
    console.warn("[blog] getAllPosts: DB unreachable, returning []", e instanceof Error ? e.message : e);
    return [];
  }

  return posts.map((p) => {
    const { minutes, words } = readingTime(p.content);
    return {
      slug: p.slug,
      title: p.title,
      description: p.description,
      publishedAt: (p.publishedAt ?? p.createdAt).toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      tags: tagsArray(p.tags),
      readingTime: minutes,
      wordCount: words,
      coverImage: p.coverImage,
    };
  });
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  let p;
  try {
    p = await prisma.blogPost.findUnique({ where: { slug } });
  } catch (e) {
    console.warn("[blog] getPostBySlug: DB unreachable, returning null", e instanceof Error ? e.message : e);
    return null;
  }
  if (!p || !p.published) return null;
  if (p.publishedAt && p.publishedAt > new Date()) return null;

  const { minutes, words } = readingTime(p.content);
  return {
    slug: p.slug,
    title: p.title,
    description: p.description,
    publishedAt: (p.publishedAt ?? p.createdAt).toISOString(),
    tags: tagsArray(p.tags),
    readingTime: minutes,
    wordCount: words,
    coverImage: p.coverImage,
    content: p.content,
    toc: extractToc(p.content),
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    metaKeywords: p.metaKeywords,
    ogImage: p.ogImage,
    canonicalUrl: p.canonicalUrl,
    noIndex: p.noIndex,
    viewCount: p.viewCount ?? 0,
    likeCount: p.likeCount ?? 0,
    commentsEnabled: p.commentsEnabled ?? true,
    updatedAt: p.updatedAt.toISOString(),
  };
}
