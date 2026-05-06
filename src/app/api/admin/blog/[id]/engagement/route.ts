import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/blog/{id}/engagement
 * Body : { resetViews?: boolean, resetLikes?: boolean, commentsEnabled?: boolean }
 *
 * Permet à l'admin de :
 *   - réinitialiser le compteur de vues
 *   - supprimer tous les likes (et remettre likeCount à 0)
 *   - couper / rallumer les commentaires pour cet article
 */
export async function PATCH(req: Request, { params }: RouteCtx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    resetViews?: boolean;
    resetLikes?: boolean;
    commentsEnabled?: boolean;
  };

  const updates: { viewCount?: number; likeCount?: number; commentsEnabled?: boolean } = {};
  if (body.resetViews) updates.viewCount = 0;
  if (body.resetLikes) updates.likeCount = 0;
  if (typeof body.commentsEnabled === "boolean") updates.commentsEnabled = body.commentsEnabled;

  if (Object.keys(updates).length === 0 && !body.resetLikes) {
    return NextResponse.json({ message: "No-op" }, { status: 400 });
  }

  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { slug: true },
  });
  if (!post) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await prisma.$transaction([
    ...(body.resetLikes
      ? [prisma.blogPostLike.deleteMany({ where: { postId } })]
      : []),
    prisma.blogPost.update({
      where: { id: postId },
      data: updates,
    }),
  ]);

  revalidatePath(`/blog/${post.slug}`);
  return NextResponse.json({ ok: true });
}
