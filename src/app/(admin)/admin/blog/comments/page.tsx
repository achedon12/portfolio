import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Check, Trash2, AlertTriangle, Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function setStatus(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  if (!Number.isFinite(id)) return;
  if (!["pending", "approved", "spam"].includes(status)) return;
  const updated = await prisma.blogComment.update({
    where: { id },
    data: { status },
    select: { post: { select: { slug: true } } },
  });
  revalidatePath("/admin/blog/comments");
  revalidatePath(`/blog/${updated.post.slug}`);
}

async function deleteComment(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  const c = await prisma.blogComment.findUnique({
    where: { id },
    select: { post: { select: { slug: true } } },
  });
  await prisma.blogComment.delete({ where: { id } });
  revalidatePath("/admin/blog/comments");
  if (c) revalidatePath(`/blog/${c.post.slug}`);
}

const TABS = ["pending", "approved", "spam"] as const;
type Tab = (typeof TABS)[number];

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminCommentsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const tab: Tab = (TABS as readonly string[]).includes(sp.status ?? "")
    ? (sp.status as Tab)
    : "pending";

  const [comments, counts] = await Promise.all([
    prisma.blogComment.findMany({
      where: { status: tab },
      orderBy: { createdAt: "desc" },
      include: {
        post: { select: { id: true, slug: true, title: true } },
      },
    }),
    prisma.blogComment.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const countByStatus = Object.fromEntries(
    counts.map((c) => [c.status, c._count._all]),
  ) as Record<string, number>;

  return (
    <div className="px-8 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
            ◊ Modération
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Commentaires</h1>
        </div>
        <Link href="/admin/blog">
          <Button variant="outline" size="sm">
            ← Retour aux articles
          </Button>
        </Link>
      </header>

      <nav className="mb-6 flex gap-2" aria-label="Filtres statut">
        {TABS.map((s) => {
          const active = s === tab;
          return (
            <Link
              key={s}
              href={`/admin/blog/comments?status=${s}`}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wider transition-colors ${
                active
                  ? "border-nebula-cyan/60 bg-nebula-cyan/10 text-nebula-cyan"
                  : "border-white/10 bg-white/5 text-slate-400 hover:text-slate-200"
              }`}
            >
              {s === "pending" ? (
                <Inbox className="h-3 w-3" />
              ) : s === "approved" ? (
                <Check className="h-3 w-3" />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
              {s === "pending" ? "en attente" : s === "approved" ? "approuvés" : "spam"}
              <span className="rounded-full bg-white/10 px-1.5 text-[10px]">
                {countByStatus[s] ?? 0}
              </span>
            </Link>
          );
        })}
      </nav>

      {comments.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-cosmos-dark/40 p-8 text-center font-mono text-sm text-slate-500">
          Aucun commentaire dans cette file.
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-white/10 bg-cosmos-dark/30 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold text-slate-100">
                    {c.pseudo}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    sur{" "}
                    <Link
                      href={`/blog/${c.post.slug}`}
                      target="_blank"
                      className="text-nebula-cyan hover:underline"
                    >
                      {c.post.title}
                    </Link>
                    {" · "}
                    {c.createdAt.toLocaleString("fr-FR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                    {c.email && ` · ${c.email}`}
                  </p>
                </div>
                <Badge
                  variant={
                    c.status === "approved"
                      ? "success"
                      : c.status === "spam"
                        ? "solar"
                        : "default"
                  }
                >
                  {c.status}
                </Badge>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                {c.message}
              </p>

              <div className="mt-4 flex flex-wrap justify-end gap-2">
                {c.status !== "approved" && (
                  <form action={setStatus}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="status" value="approved" />
                    <Button type="submit" size="sm">
                      <Check className="h-3.5 w-3.5" />
                      Approuver
                    </Button>
                  </form>
                )}
                {c.status !== "spam" && (
                  <form action={setStatus}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="status" value="spam" />
                    <Button type="submit" variant="outline" size="sm">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Spam
                    </Button>
                  </form>
                )}
                {c.status !== "pending" && (
                  <form action={setStatus}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="status" value="pending" />
                    <Button type="submit" variant="outline" size="sm">
                      Remettre en attente
                    </Button>
                  </form>
                )}
                <form action={deleteComment}>
                  <input type="hidden" name="id" value={c.id} />
                  <Button type="submit" variant="destructive" size="sm">
                    <Trash2 className="h-3.5 w-3.5" />
                    Suppr.
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
