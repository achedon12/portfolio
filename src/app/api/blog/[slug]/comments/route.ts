import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogCommentSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { hashIp } from "@/lib/ip-hash";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/blog/{slug}/comments
 * Renvoie uniquement les commentaires `approved`, ordre chronologique.
 */
export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!post) {
    return NextResponse.json({ comments: [] }, { status: 200 });
  }

  const comments = await prisma.blogComment.findMany({
    where: { postId: post.id, status: "approved" },
    orderBy: { createdAt: "asc" },
    select: { id: true, pseudo: true, message: true, createdAt: true },
  });

  return NextResponse.json(
    {
      comments: comments.map((c) => ({
        id: c.id,
        pseudo: c.pseudo,
        message: c.message,
        createdAt: c.createdAt.toISOString(),
      })),
    },
    { status: 200 },
  );
}

/**
 * POST /api/blog/{slug}/comments
 * Crée un commentaire en statut `pending` — l'admin valide depuis /admin/blog/comments.
 *
 * Anti-spam :
 *   - Honeypot `website` (champ caché, doit rester vide)
 *   - Rate limit 3 commentaires / IP / heure (toutes posts confondus)
 *   - IP hashée stockée pour bannir un spammeur si besoin (jamais l'IP brute)
 */
export async function POST(req: Request, { params }: Ctx) {
  const { slug } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Body JSON invalide" }, { status: 400 });
  }

  const parsed = blogCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation échouée", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true, status: "spam" }, { status: 200 });
  }

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { id: true, commentsEnabled: true, published: true },
  });
  if (!post || !post.published) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  if (!post.commentsEnabled) {
    return NextResponse.json(
      { code: "commentsDisabled", message: "Commentaires désactivés sur cet article" },
      { status: 403 },
    );
  }

  const ip = getClientIp(req);
  const ipHash = hashIp(ip);

  const rl = await checkRateLimit(`comment:${ipHash}`, 3, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { code: "rateLimited", message: "Trop de commentaires. Réessaie plus tard." },
      { status: 429 },
    );
  }

  const userAgent = req.headers.get("user-agent");
  const created = await prisma.blogComment.create({
    data: {
      postId: post.id,
      pseudo: parsed.data.pseudo,
      message: parsed.data.message,
      email: parsed.data.email && parsed.data.email.length > 0 ? parsed.data.email : null,
      ipHash,
      userAgent: userAgent && userAgent.length > 0 ? userAgent.slice(0, 500) : null,
      status: "pending",
    },
    select: { id: true },
  });

  return NextResponse.json(
    { ok: true, id: created.id, status: "pending" },
    { status: 201 },
  );
}
