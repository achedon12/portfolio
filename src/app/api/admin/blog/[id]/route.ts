import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { blogPostSchema } from "@/lib/validations";

export const runtime = "nodejs";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

function nullable(v: string | null | undefined) {
  return v && v.length > 0 ? v : null;
}

export async function PATCH(req: Request, { params }: RouteCtx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = blogPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation échouée", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const data = parsed.data;

  try {
    // Récupère l'ancien slug pour invalider sa cache si renommé
    const previous = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: { slug: true },
    });

    const updated = await prisma.blogPost.update({
      where: { id: postId },
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description,
        content: data.content,
        coverImage: nullable(data.coverImage),
        tags: data.tags ?? [],
        metaTitle: nullable(data.metaTitle),
        metaDescription: nullable(data.metaDescription),
        metaKeywords: nullable(data.metaKeywords),
        ogImage: nullable(data.ogImage),
        canonicalUrl: nullable(data.canonicalUrl),
        noIndex: data.noIndex ?? false,
        published: data.published ?? false,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${updated.slug}`);
    if (previous && previous.slug !== updated.slug) {
      revalidatePath(`/blog/${previous.slug}`);
    }
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "DB error";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteCtx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { slug: true },
  });
  await prisma.blogPost.delete({ where: { id: postId } });

  revalidatePath("/blog");
  if (post) revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ ok: true });
}
