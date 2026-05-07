import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import {
  NOW_LAST_UPDATED,
  nowFocus,
  nowReading,
  nowSetupChanges,
  type NowItem,
} from "@/lib/now";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Now" });
  const isFr = locale === "fr";
  const path = isFr ? "/now" : "/en/now";

  const title = t("metaTitle");
  const description = t("metaDescription");
  const ogAlt = isFr ? "Léo Deroin — En ce moment" : "Léo Deroin — Right now";

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { fr: "/now", en: "/en/now", "x-default": "/now" },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: path,
      locale: isFr ? "fr_FR" : "en_US",
      siteName: "Léo Deroin",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: "/opengraph-image", alt: ogAlt }],
    },
  };
}

function pickText(item: NowItem, isFr: boolean): string {
  return isFr ? item.fr : (item.en ?? item.fr);
}

export default async function NowPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale as Locale);

  const t = await getTranslations("Now");
  const tCommon = await getTranslations("Common");
  const isFr = locale === "fr";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr";
  const localePrefix = isFr ? "" : "/en";
  const homeName = tCommon("home");

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: homeName, href: "/" },
    { name: t("title") },
  ];

  const breadcrumbsLd = breadcrumbJsonLd([
    { name: homeName, url: `${baseUrl}${localePrefix}/` },
    { name: t("title"), url: `${baseUrl}${localePrefix}/now` },
  ]);

  const lastUpdatedFmt = new Date(NOW_LAST_UPDATED).toLocaleDateString(
    isFr ? "fr-FR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  const focusMain = nowFocus.filter((f) => f.category === "main");
  const focusSide = nowFocus.filter((f) => f.category === "side");

  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-20">
      <Breadcrumbs
        items={breadcrumbItems}
        ariaLabel={tCommon("breadcrumbAria")}
        className="mb-8"
      />

      <header className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
          {t("kicker")}
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">{t("title")}</h1>
        <p className="mt-4 max-w-2xl text-slate-400">{t("intro")}</p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-slate-500">
          {t("lastUpdated")} : <time dateTime={NOW_LAST_UPDATED}>{lastUpdatedFmt}</time>
        </p>
      </header>

      <div className="space-y-6">
        {focusMain.length > 0 && (
          <Card className="p-6">
            <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-nebula-cyan">
              ◊ {t("sections.main")}
            </h2>
            <ul className="space-y-3">
              {focusMain.map((item) => (
                <NowEntry key={item.key} item={item} isFr={isFr} />
              ))}
            </ul>
          </Card>
        )}

        {focusSide.length > 0 && (
          <Card className="p-6">
            <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-nebula-cyan">
              ◊ {t("sections.side")}
            </h2>
            <ul className="space-y-3">
              {focusSide.map((item) => (
                <NowEntry key={item.key} item={item} isFr={isFr} />
              ))}
            </ul>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-nebula-cyan">
            ◊ {t("sections.reading")}
          </h2>
          {nowReading.length > 0 ? (
            <ul className="space-y-3">
              {nowReading.map((item) => (
                <NowEntry key={item.key} item={item} isFr={isFr} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">{t("sections.empty")}</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-nebula-cyan">
            ◊ {t("sections.setup")}
          </h2>
          {nowSetupChanges.length > 0 ? (
            <ul className="space-y-3">
              {nowSetupChanges.map((item) => (
                <NowEntry key={item.key} item={item} isFr={isFr} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">{t("sections.empty")}</p>
          )}
          <Link
            href="/uses"
            className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-nebula-cyan transition-colors hover:text-nebula-cyan/80"
          >
            {t("viewSetup")} →
          </Link>
        </Card>
      </div>

      <p className="mt-12 text-center font-mono text-[10px] uppercase tracking-wider text-slate-500">
        {t("inspired")}{" "}
        <a
          href="https://nownownow.com/about"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-nebula-cyan/40 underline-offset-2 hover:text-nebula-cyan"
        >
          nownownow.com
        </a>
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbsLd }}
      />
    </div>
  );
}

function NowEntry({ item, isFr }: { item: NowItem; isFr: boolean }) {
  const text = pickText(item, isFr);
  return (
    <li className="flex items-start gap-2 text-sm leading-relaxed text-slate-300">
      <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-nebula-cyan/70" />
      <span className="flex-1">
        {text}{" "}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-nebula-cyan/80 hover:text-nebula-cyan"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </span>
    </li>
  );
}
