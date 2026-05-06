import Link from "next/link";
import { ExternalLink, Eye, Users, BarChart3, MousePointer2 } from "lucide-react";
import {
  isMatomoConfigured,
  getTodaySummary,
  getVisitsSummary,
  getDailySeries,
  getTopPages,
  getTopReferrers,
  type VisitsSummary,
  type DailyPoint,
  type TopPage,
  type TopReferrer,
} from "@/lib/matomo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/components/admin/Sparkline";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  if (!isMatomoConfigured()) {
    return (
      <div className="px-8 py-10">
        <header className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
            ◊ Analytics
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Statistiques Matomo</h1>
        </header>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-300">
              Matomo n'est pas configuré. Ajoute les variables suivantes dans ton{" "}
              <code className="font-mono text-xs text-nebula-cyan">.env</code> :
            </p>
            <pre className="mt-4 overflow-x-auto rounded-md bg-cosmos-deep/80 p-4 font-mono text-xs text-slate-300">
{`NEXT_PUBLIC_MATOMO_URL=https://matomo.leoderoin.fr
NEXT_PUBLIC_MATOMO_SITE_ID=2
MATOMO_API_TOKEN=<ton token Matomo, créé dans Personal Settings → Security>`}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4 appels Matomo en parallèle (caches Next 5min via la lib).
  let today: VisitsSummary | null = null;
  let last7d: VisitsSummary | null = null;
  let last30d: VisitsSummary | null = null;
  let series: DailyPoint[] = [];
  let topPages: TopPage[] = [];
  let topReferrers: TopReferrer[] = [];
  let fetchError: string | null = null;

  try {
    const [t, w, m, s, p, r] = await Promise.all([
      getTodaySummary(),
      getVisitsSummary("last7"),
      getVisitsSummary("last30"),
      getDailySeries("last30"),
      getTopPages(10),
      getTopReferrers(10),
    ]);
    today = t;
    last7d = w;
    last30d = m;
    series = s;
    topPages = p;
    topReferrers = r;
  } catch (e) {
    fetchError = e instanceof Error ? e.message : "Erreur Matomo";
  }

  return (
    <div className="px-8 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
            ◊ Analytics
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Statistiques Matomo</h1>
        </div>
        <Link
          href={process.env.NEXT_PUBLIC_MATOMO_URL ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs uppercase tracking-wider text-slate-300 transition-colors hover:border-nebula-cyan/40 hover:text-nebula-cyan"
        >
          Ouvrir Matomo
          <ExternalLink className="h-3 w-3" />
        </Link>
      </header>

      {fetchError && (
        <div className="mb-6 rounded-md border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          Échec récupération Matomo — {fetchError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={<Eye className="h-4 w-4" />}
          label="Aujourd'hui"
          value={today?.nb_visits ?? 0}
          sub={`${today?.nb_pageviews ?? 0} pages vues`}
        />
        <SummaryCard
          icon={<Users className="h-4 w-4" />}
          label="7 derniers jours"
          value={last7d?.nb_visits ?? 0}
          sub={`${last7d?.nb_uniq_visitors ?? 0} visiteurs uniques`}
        />
        <SummaryCard
          icon={<BarChart3 className="h-4 w-4" />}
          label="30 derniers jours"
          value={last30d?.nb_visits ?? 0}
          sub={`${last30d?.nb_pageviews ?? 0} pages vues`}
        />
        <SummaryCard
          icon={<MousePointer2 className="h-4 w-4" />}
          label="Bounce rate (30j)"
          value={last30d?.bounce_rate ?? "—"}
          sub={`temps moyen : ${formatDuration(last30d?.avg_time_on_site ?? 0)}`}
        />
      </div>

      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Visites — 30 derniers jours</CardTitle>
          </CardHeader>
          <CardContent>
            <Sparkline
              points={series.map((d) => ({ date: d.date, value: d.visits }))}
              ariaLabel="Visites quotidiennes sur les 30 derniers jours"
              unitLabel="visites"
            />
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 pages — 30 derniers jours</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {topPages.length === 0 ? (
              <p className="px-5 py-8 text-center font-mono text-xs text-slate-500">
                Aucune donnée.
              </p>
            ) : (
              <ol className="divide-y divide-white/5">
                {topPages.map((p, i) => (
                  <li
                    key={`${p.label}-${i}`}
                    className="flex items-center justify-between gap-4 px-5 py-3"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="font-mono text-[10px] text-slate-600 w-5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate font-mono text-xs text-slate-300" title={p.label}>
                        {p.label || "/"}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-nebula-cyan">
                      {p.nb_visits ?? 0}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 sources — 30 derniers jours</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {topReferrers.length === 0 ? (
              <p className="px-5 py-8 text-center font-mono text-xs text-slate-500">
                Aucune source identifiée.
              </p>
            ) : (
              <ol className="divide-y divide-white/5">
                {topReferrers.map((r, i) => (
                  <li
                    key={`${r.label}-${i}`}
                    className="flex items-center justify-between gap-4 px-5 py-3"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="font-mono text-[10px] text-slate-600 w-5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate font-mono text-xs text-slate-300" title={r.label}>
                        {r.label}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-nebula-cyan">
                      {r.nb_visits}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </section>

      <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-wider text-slate-600">
        Données récupérées via la Reporting API Matomo · cache Next 5 min
      </p>
    </div>
  );
}

function SummaryCard({
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
        <p className="font-display text-3xl font-bold text-slate-100">
          {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
        </p>
        {sub && <p className="mt-1 font-mono text-[10px] text-slate-500">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "0s";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}
