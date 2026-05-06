import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation échouée", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const created = await prisma.project.create({
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        description: parsed.data.description,
        longContent: parsed.data.longContent ?? null,
        coverImage: parsed.data.coverImage,
        gallery: parsed.data.gallery ?? [],
        techStack: parsed.data.techStack,
        category: parsed.data.category,
        liveUrl: parsed.data.liveUrl || null,
        githubUrl: parsed.data.githubUrl || null,
        featured: parsed.data.featured ?? false,
      },
    });
    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "DB error";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
