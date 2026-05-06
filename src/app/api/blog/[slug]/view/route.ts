import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { hashIp } from "@/lib/ip-hash";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ slug: string }>;
}

/**
 * Incrémente le compteur de vues d'un article.
 * Rate limit : 1 vue / IP / article / 24h — empêche le spam de F5.
 */
export async function POST(req: Request, { params }: Ctx) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { id: true, viewCount: true, published: true },
  });
  if (!post || !post.published) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const ipHash = hashIp(getClientIp(req));
  const rl = await checkRateLimit(`view:${post.id}:${ipHash}`, 1, 24 * 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ viewCount: post.viewCount, counted: false }, { status: 200 });
  }

  const updated = await prisma.blogPost.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
    select: { viewCount: true },
  });

  return NextResponse.json({ viewCount: updated.viewCount, counted: true }, { status: 200 });
}
