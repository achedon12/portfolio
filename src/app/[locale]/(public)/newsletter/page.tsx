import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Mail, Sparkles, ShieldCheck, Newspaper } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Newsletter.landing" });
  const isFr = locale === "fr";
  const path = isFr ? "/newsletter" : "/en/newsletter";
  const title = t("metaTitle");
  const description = t("metaDescription");
  const ogAlt = t("ogAlt");

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { fr: "/newsletter", en: "/en/newsletter", "x-default": "/newsletter" },
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

export default async function NewsletterLandingPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale as Locale);
  const t = await getTranslations("Newsletter");
  const tl = await getTranslations("Newsletter.landing");

  const isFr = locale === "fr";
  const home = isFr ? `${APP_URL}/` : `${APP_URL}/en`;
  const current = isFr ? `${APP_URL}/newsletter` : `${APP_URL}/en/newsletter`;
  const jsonLd = breadcrumbJsonLd([
    { name: tl("breadcrumbHome"), url: home },
    { name: tl("breadcrumbCurrent"), url: current },
  ]);

  return (
    <section className="mx-auto max-w-3xl px-6 pt-16 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <Breadcrumbs
        ariaLabel={tl("breadcrumbCurrent")}
        items={[
          { name: tl("breadcrumbHome"), href: "/" },
          { name: tl("breadcrumbCurrent") },
        ]}
        className="mb-10"
      />

      <header className="mb-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-nebula-cyan/80">
          {t("kicker")}
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-slate-100 sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400">
          {t("intro")}
        </p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-cosmos-dark/40 p-6 backdrop-blur-sm sm:p-8">
        <div className="mb-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-nebula-cyan/80">
          <Mail className="h-3.5 w-3.5" />
          <span>◊ Embarquement</span>
        </div>
        <NewsletterForm variant="full" />
        <p className="mt-5 flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
          <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400/80" />
          <span>{tl("pledge")}</span>
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-3">
        <BulletCard
          icon={<Newspaper className="h-4 w-4" />}
          title={tl("bullets.articles.title")}
          description={tl("bullets.articles.description")}
        />
        <BulletCard
          icon={<Sparkles className="h-4 w-4" />}
          title={tl("bullets.experiments.title")}
          description={tl("bullets.experiments.description")}
        />
        <BulletCard
          icon={<ShieldCheck className="h-4 w-4" />}
          title={tl("bullets.noSpam.title")}
          description={tl("bullets.noSpam.description")}
        />
      </div>
    </section>
  );
}

function BulletCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-nebula-cyan/30 bg-nebula-cyan/10 text-nebula-cyan">
        {icon}
      </div>
      <h2 className="font-display text-base font-semibold text-slate-100">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}
