import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { uses, USES_LAST_UPDATED, type SectionId } from "@/lib/uses";
import { breadcrumbJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Uses" });
  const isFr = locale === "fr";
  const path = isFr ? "/uses" : "/en/uses";

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: path,
      languages: { fr: "/uses", en: "/en/uses", "x-default": "/uses" },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      type: "website",
      url: path,
      locale: isFr ? "fr_FR" : "en_US",
    },
  };
}

const SECTION_ORDER: SectionId[] = [
  "editor",
  "stack",
  "hardware",
  "os",
  "terminal",
  "browser",
  "browserExtensions",
  "tools",
  "apps",
];

export default async function UsesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Uses");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr";
  const isFr = locale === "fr";
  const localePrefix = isFr ? "" : "/en";
  const homeName = isFr ? "Accueil" : "Home";

  const breadcrumbs = breadcrumbJsonLd([
    { name: homeName, url: `${baseUrl}${localePrefix}/` },
    { name: t("title"), url: `${baseUrl}${localePrefix}/uses` },
  ]);

  const lastUpdatedFmt = new Date(USES_LAST_UPDATED).toLocaleDateString(
    isFr ? "fr-FR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  const sections = SECTION_ORDER.map((id) => {
    const section = uses.find((s) => s.id === id);
    if (!section) return null;
    return { id, items: section.items };
  }).filter((x): x is { id: SectionId; items: typeof uses[number]["items"] } => x !== null);

  return (
    <div className="mx-auto max-w-4xl px-6 pt-32 pb-20">
      <header className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
          {t("kicker")}
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">{t("title")}</h1>
        <p className="mt-4 max-w-2xl text-slate-400">{t("intro")}</p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-slate-500">
          {t("lastUpdated")} : <time dateTime={USES_LAST_UPDATED}>{lastUpdatedFmt}</time>
        </p>
      </header>

      <div className="space-y-6">
        {sections.map(({ id, items }) => (
          <Card key={id} className="p-6">
            <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-nebula-cyan">
              ◊ {t(`sections.${id}`)}
            </h2>
            <ul className="space-y-3">
              {items.map((item) => {
                const detail = isFr ? item.fr : (item.en ?? item.fr);
                return (
                  <li key={item.name} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                    <span className="font-display text-base font-semibold text-slate-100">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:text-nebula-cyan"
                        >
                          {item.name}
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </a>
                      ) : (
                        item.name
                      )}
                    </span>
                    {detail && (
                      <span className="text-sm text-slate-400 sm:before:content-['—'] sm:before:mr-1.5 sm:before:text-slate-600">
                        {detail}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>

      <p className="mt-12 rounded-md border border-white/10 bg-cosmos-dark/40 p-4 font-mono text-xs text-slate-500">
        {t("inspiredBy")}{" "}
        <a
          href="https://uses.tech/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-nebula-cyan hover:underline"
        >
          uses.tech
        </a>
        .
      </p>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbs }} />
    </div>
  );
}
