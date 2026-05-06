import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ id: string }>;
}

const ALLOWED_STATUSES = ["pending", "approved", "spam"] as const;

/**
 * PATCH /api/admin/blog/comments/{id}
 * Body : { status: "approved" | "spam" | "pending" }
 *
 * Modifie le statut d'un commentaire (validation, marquage spam, retour en attente).
 */
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const commentId = Number(id);
  if (!Number.isFinite(commentId)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as { status?: string };
  const status = body.status as (typeof ALLOWED_STATUSES)[number] | undefined;
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.blogComment.update({
    where: { id: commentId },
    data: { status },
    select: { post: { select: { slug: true } } },
  });

  revalidatePath(`/blog/${updated.post.slug}`);
  return NextResponse.json({ ok: true, status });
}

/**
 * DELETE /api/admin/blog/comments/{id}
 * Suppression définitive.
 */
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const commentId = Number(id);
  if (!Number.isFinite(commentId)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const comment = await prisma.blogComment.findUnique({
    where: { id: commentId },
    select: { post: { select: { slug: true } } },
  });
  if (!comment) {
    return NextResponse.json({ ok: true });
  }

  await prisma.blogComment.delete({ where: { id: commentId } });
  revalidatePath(`/blog/${comment.post.slug}`);
  return NextResponse.json({ ok: true });
}
