import Link from "next/link";
import { Plus, Eye, Heart, MessageSquare } from "lucide-react";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function deletePost(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  const post = await prisma.blogPost.findUnique({ where: { id }, select: { slug: true } });
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  if (post) revalidatePath(`/blog/${post.slug}`);
}

async function togglePublished(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const isPublished = formData.get("published") === "true";
  if (!Number.isFinite(id)) return;
  const next = !isPublished;
  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      published: next,
      publishedAt: next ? new Date() : null,
    },
    select: { slug: true },
  });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
}

async function toggleComments(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const enabled = formData.get("commentsEnabled") === "true";
  if (!Number.isFinite(id)) return;
  const post = await prisma.blogPost.update({
    where: { id },
    data: { commentsEnabled: !enabled },
    select: { slug: true },
  });
  revalidatePath("/admin/blog");
  revalidatePath(`/blog/${post.slug}`);
}

async function resetEngagement(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  const post = await prisma.blogPost.findUnique({
    where: { id },
    select: { slug: true },
  });
  if (!post) return;
  await prisma.$transaction([
    prisma.blogPostLike.deleteMany({ where: { postId: id } }),
    prisma.blogPost.update({
      where: { id },
      data: { viewCount: 0, likeCount: 0 },
    }),
  ]);
  revalidatePath("/admin/blog");
  revalidatePath(`/blog/${post.slug}`);
}

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: [{ published: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="px-8 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
            ◊ Articles
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Blog</h1>
        </div>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nouvel article
          </Button>
        </Link>
      </header>

      <div className="overflow-hidden rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-cosmos-dark/60 text-left font-mono text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Publié le</th>
              <th className="px-4 py-3">SEO</th>
              <th className="px-4 py-3">Engagement</th>
              <th className="px-4 py-3">Comments</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {posts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center font-mono text-slate-500">
                  Aucun article — commence par en créer un.
                </td>
              </tr>
            )}
            {posts.map((p) => (
              <tr key={p.id} className="bg-cosmos-dark/20 hover:bg-cosmos-dark/40">
                <td className="px-4 py-3">
                  <p className="font-display font-medium text-slate-100">{p.title}</p>
                  <p className="font-mono text-[10px] text-slate-500">{p.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <form action={togglePublished}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="published" value={String(p.published)} />
                    <button
                      type="submit"
                      className="font-mono text-xs"
                      aria-pressed={p.published}
                    >
                      {p.published ? (
                        <Badge variant="success">publié</Badge>
                      ) : (
                        <Badge variant="default">brouillon</Badge>
                      )}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {p.publishedAt
                    ? p.publishedAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {p.noIndex ? (
                    <Badge variant="solar">noindex</Badge>
                  ) : (
                    <Badge variant="cyan">indexé</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1" title="Vues">
                      <Eye className="h-3 w-3" />
                      {(p.viewCount ?? 0).toLocaleString("fr-FR")}
                    </span>
                    <span className="inline-flex items-center gap-1" title="Likes">
                      <Heart className="h-3 w-3" />
                      {(p.likeCount ?? 0).toLocaleString("fr-FR")}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <form action={toggleComments}>
                    <input type="hidden" name="id" value={p.id} />
                    <input
                      type="hidden"
                      name="commentsEnabled"
                      value={String(p.commentsEnabled ?? true)}
                    />
                    <button
                      type="submit"
                      aria-pressed={p.commentsEnabled ?? true}
                      className="font-mono text-xs"
                    >
                      {(p.commentsEnabled ?? true) ? (
                        <Badge variant="cyan">
                          <MessageSquare className="mr-1 h-3 w-3" />
                          activés
                        </Badge>
                      ) : (
                        <Badge variant="default">désactivés</Badge>
                      )}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex flex-wrap justify-end gap-2">
                    <Link href={`/admin/blog/${p.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Éditer
                      </Button>
                    </Link>
                    <form action={resetEngagement}>
                      <input type="hidden" name="id" value={p.id} />
                      <Button type="submit" variant="outline" size="sm" title="Reset vues + likes">
                        Reset stats
                      </Button>
                    </form>
                    <form action={deletePost}>
                      <input type="hidden" name="id" value={p.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        Suppr.
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
