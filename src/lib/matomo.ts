/**
 * Wrapper minimal autour de la Reporting API Matomo.
 *
 * À importer UNIQUEMENT depuis du code serveur (Server Component / Route Handler) :
 * `MATOMO_API_TOKEN` est un secret, ne doit jamais finir dans le bundle client.
 * Comme la variable n'est pas préfixée `NEXT_PUBLIC_`, Next ne l'injecte pas
 * côté client — la sécurité est implicite.
 *
 * Doc API : https://developer.matomo.org/api-reference/reporting-api
 */

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
const SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
const TOKEN = process.env.MATOMO_API_TOKEN;

export function isMatomoConfigured(): boolean {
  return Boolean(MATOMO_URL && SITE_ID && TOKEN);
}

export interface VisitsSummary {
  nb_visits: number;
  nb_uniq_visitors: number;
  nb_users: number;
  nb_pageviews: number;
  nb_actions: number;
  bounce_rate: string; // "45%"
  avg_time_on_site: number;
}

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  visits: number;
  pageviews: number;
}

export interface TopPage {
  label: string; // /blog/foo
  url?: string;
  nb_visits: number;
  nb_hits: number;
}

export interface TopReferrer {
  label: string; // domain
  url?: string;
  nb_visits: number;
}

interface MatomoArgs {
  method: string;
  period: "day" | "week" | "month" | "year" | "range";
  date: string;
  filter_limit?: number;
  segment?: string;
  flat?: 0 | 1;
}

async function call<T>(args: MatomoArgs): Promise<T> {
  if (!isMatomoConfigured()) {
    throw new Error("Matomo not configured (NEXT_PUBLIC_MATOMO_URL / NEXT_PUBLIC_MATOMO_SITE_ID / MATOMO_API_TOKEN)");
  }
  const params = new URLSearchParams({
    module: "API",
    method: args.method,
    idSite: SITE_ID!,
    period: args.period,
    date: args.date,
    format: "json",
    token_auth: TOKEN!,
  });
  if (args.filter_limit !== undefined) params.set("filter_limit", String(args.filter_limit));
  if (args.segment) params.set("segment", args.segment);
  if (args.flat !== undefined) params.set("flat", String(args.flat));

  const url = `${MATOMO_URL}/index.php?${params.toString()}`;
  const res = await fetch(url, {
    next: { revalidate: 300 }, // cache 5 min côté Next pour éviter de marteler Matomo
    cache: "force-cache",
  });
  if (!res.ok) {
    throw new Error(`Matomo API ${res.status} (${args.method})`);
  }
  return (await res.json()) as T;
}

/** Stats agrégées sur la période (range, week, month). */
export async function getVisitsSummary(date: string = "last30"): Promise<VisitsSummary> {
  return call<VisitsSummary>({ method: "VisitsSummary.get", period: "range", date });
}

/** Stats du jour exact (pour la card "aujourd'hui"). */
export async function getTodaySummary(): Promise<VisitsSummary> {
  return call<VisitsSummary>({ method: "VisitsSummary.get", period: "day", date: "today" });
}

/** Série temporelle journalière sur N jours. */
export async function getDailySeries(date: string = "last30"): Promise<DailyPoint[]> {
  const data = await call<Record<string, VisitsSummary | []>>({
    method: "VisitsSummary.get",
    period: "day",
    date,
  });
  return Object.entries(data).map(([day, v]) => ({
    date: day,
    visits: Array.isArray(v) ? 0 : v.nb_visits ?? 0,
    pageviews: Array.isArray(v) ? 0 : v.nb_pageviews ?? 0,
  }));
}

export async function getTopPages(limit = 10, date: string = "last30"): Promise<TopPage[]> {
  return call<TopPage[]>({
    method: "Actions.getPageUrls",
    period: "range",
    date,
    filter_limit: limit,
    flat: 1,
  });
}

export async function getTopReferrers(limit = 10, date: string = "last30"): Promise<TopReferrer[]> {
  return call<TopReferrer[]>({
    method: "Referrers.getWebsites",
    period: "range",
    date,
    filter_limit: limit,
  });
}
