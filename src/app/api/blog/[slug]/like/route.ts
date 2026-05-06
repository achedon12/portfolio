import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { hashIp } from "@/lib/ip-hash";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ slug: string }>;
}

/**
 * Toggle un like anonyme sur un article.
 * Une IP (hashée) ne peut liker qu'une fois — une seconde requête unlike.
 *
 * Rate limit : 10 toggles / IP / article / heure (anti-spam de clic).
 */
export async function POST(req: Request, { params }: Ctx) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { id: true, likeCount: true, published: true },
  });
  if (!post || !post.published) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const ipHash = hashIp(getClientIp(req));

  const rl = await checkRateLimit(`like:${post.id}:${ipHash}`, 10, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ message: "Rate limited" }, { status: 429 });
  }

  const existing = await prisma.blogPostLike.findUnique({
    where: { postId_ipHash: { postId: post.id, ipHash } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.blogPostLike.delete({ where: { id: existing.id } }),
      prisma.blogPost.update({
        where: { id: post.id },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    return NextResponse.json({ liked: false, likeCount: Math.max(0, post.likeCount - 1) });
  }

  await prisma.$transaction([
    prisma.blogPostLike.create({ data: { postId: post.id, ipHash } }),
    prisma.blogPost.update({
      where: { id: post.id },
      data: { likeCount: { increment: 1 } },
    }),
  ]);
  return NextResponse.json({ liked: true, likeCount: post.likeCount + 1 });
}

/**
 * Permet au client de savoir si l'IP courante a déjà liké le post (sans toggler).
 * Utilisé pour initialiser le bouton coeur côté client après hydration.
 */
export async function GET(req: Request, { params }: Ctx) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { id: true, likeCount: true },
  });
  if (!post) {
    return NextResponse.json({ liked: false, likeCount: 0 });
  }

  const ipHash = hashIp(getClientIp(req));
  const existing = await prisma.blogPostLike.findUnique({
    where: { postId_ipHash: { postId: post.id, ipHash } },
    select: { id: true },
  });

  return NextResponse.json({ liked: !!existing, likeCount: post.likeCount });
}
