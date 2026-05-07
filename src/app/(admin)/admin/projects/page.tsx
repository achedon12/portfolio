import Link from "next/link";
import { Plus } from "lucide-react";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function deleteProject(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await prisma.project.delete({ where: { id } });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

async function toggleFeatured(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const featured = formData.get("featured") === "true";
  if (!Number.isFinite(id)) return;
  await prisma.project.update({ where: { id }, data: { featured: !featured } });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

async function togglePublished(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const published = formData.get("published") === "true";
  if (!Number.isFinite(id)) return;
  const updated = await prisma.project.update({
    where: { id },
    data: { published: !published },
    select: { slug: true },
  });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath(`/projects/${updated.slug}`);
  revalidatePath("/sitemap.xml");
}

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  });

  return (
    <div className="px-8 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
            ◊ Hangar
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Projets</h1>
        </div>
        <Link href="/admin/projects/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nouveau projet
          </Button>
        </Link>
      </header>

      <div className="overflow-hidden rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-cosmos-dark/60 text-left font-mono text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Visible</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">Publié</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {projects.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center font-mono text-slate-500">
                  Aucun projet — commence par en créer un.
                </td>
              </tr>
            )}
            {projects.map((p) => (
              <tr
                key={p.id}
                className={
                  p.published
                    ? "bg-cosmos-dark/20 hover:bg-cosmos-dark/40"
                    : "bg-cosmos-dark/10 opacity-60 hover:bg-cosmos-dark/30"
                }
              >
                <td className="px-4 py-3 font-display font-medium text-slate-100">{p.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.slug}</td>
                <td className="px-4 py-3">
                  <Badge variant="default">{p.category}</Badge>
                </td>
                <td className="px-4 py-3">
                  <form action={togglePublished}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="published" value={String(p.published)} />
                    <button
                      type="submit"
                      aria-pressed={p.published}
                      title={
                        p.published
                          ? "Visible sur le site — clic pour cacher"
                          : "Caché — clic pour publier"
                      }
                      className={
                        p.published
                          ? "rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/15"
                          : "rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-300 hover:bg-amber-500/15"
                      }
                    >
                      {p.published ? "● Visible" : "○ Caché"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={toggleFeatured}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="featured" value={String(p.featured)} />
                    <button
                      type="submit"
                      className="font-mono text-xs"
                      aria-pressed={p.featured}
                    >
                      {p.featured ? "★ ON" : "☆ OFF"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {p.publishedAt.toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <Link href={`/admin/projects/${p.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Éditer
                      </Button>
                    </Link>
                    <form action={deleteProject}>
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
