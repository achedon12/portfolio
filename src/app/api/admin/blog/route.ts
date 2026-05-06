import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { blogPostSchema } from "@/lib/validations";

export const runtime = "nodejs";

function nullable(v: string | null | undefined) {
  return v && v.length > 0 ? v : null;
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

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
    const created = await prisma.blogPost.create({
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
    revalidatePath(`/blog/${created.slug}`);
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "DB error";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
