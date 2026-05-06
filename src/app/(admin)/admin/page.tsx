import Link from "next/link";
import { Mail, FolderKanban, Eye, Newspaper, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isMatomoConfigured, getVisitsSummary, type VisitsSummary } from "@/lib/matomo";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [totalMessages, unreadMessages, totalProjects, totalPosts] = await Promise.all([
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.project.count(),
    prisma.blogPost.count({ where: { published: true } }),
  ]);

  const latest = await prisma.contactMessage.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  // Matomo : best-effort. Si non configuré ou erreur, fallback gracieux.
  let last7d: VisitsSummary | null = null;
  if (isMatomoConfigured()) {
    try {
      last7d = await getVisitsSummary("last7");
    } catch {
      last7d = null;
    }
  }

  return (
    <div className="px-8 py-10">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
          ◊ Cockpit
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">Vue d'ensemble</h1>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<Mail className="h-4 w-4" />}
          label="Messages"
          value={totalMessages}
          sub={`${unreadMessages} non lus`}
        />
        <Stat icon={<FolderKanban className="h-4 w-4" />} label="Projets" value={totalProjects} />
        <Stat icon={<Newspaper className="h-4 w-4" />} label="Articles publiés" value={totalPosts} />
        <Link href="/admin/analytics" className="group">
          <Card className="h-full transition-colors group-hover:border-nebula-cyan/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
                  Visites (7j)
                </CardTitle>
                <span className="text-nebula-cyan">
                  <Eye className="h-4 w-4" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {last7d ? (
                <>
                  <p className="font-display text-3xl font-bold">
                    {last7d.nb_visits.toLocaleString("fr-FR")}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] text-slate-500">
                    {last7d.nb_uniq_visitors} uniques
                    <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </p>
                </>
              ) : isMatomoConfigured() ? (
                <p className="font-mono text-xs text-slate-500">Matomo indisponible</p>
              ) : (
                <p className="font-mono text-xs text-slate-500">
                  Matomo non configuré
                  <br />
                  <span className="text-slate-600">→ ouvrir /admin/analytics</span>
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-lg font-semibold">Derniers messages</h2>
        {latest.length === 0 ? (
          <p className="rounded-md border border-white/10 bg-cosmos-dark/40 p-6 text-center font-mono text-sm text-slate-500">
            Aucun message reçu pour le moment.
          </p>
        ) : (
          <div className="space-y-2">
            {latest.map((m) => (
              <Link
                key={m.id}
                href="/admin/messages"
                className="flex items-center justify-between rounded-md border border-white/10 bg-cosmos-dark/40 p-4 transition-colors hover:border-nebula-cyan/40"
              >
                <div>
                  <p className="font-display text-sm font-medium text-slate-100">
                    {m.name} <span className="text-slate-500">— {m.subject}</span>
                  </p>
                  <p className="line-clamp-1 text-xs text-slate-400">{m.message}</p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  {m.createdAt.toLocaleDateString("fr-FR")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs uppercase tracking-wider text-slate-400">
            {label}
          </CardTitle>
          <span className="text-nebula-cyan">{icon}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl font-bold">{value}</p>
        {sub && <p className="mt-1 font-mono text-[10px] text-slate-500">{sub}</p>}
      </CardContent>
    </Card>
  );
}
