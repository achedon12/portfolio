import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { ProjectsGrid } from "@/components/projects/ProjectFilters";
import { breadcrumbJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Projects" });
  const isFr = locale === "fr";
  const path = isFr ? "/projects" : "/en/projects";
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: path,
      languages: { fr: "/projects", en: "/en/projects", "x-default": "/projects" },
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

export const revalidate = 60;

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Projects");
  const tNav = await getTranslations("Nav");

  const projects = await prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  });

  const data = projects.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    coverImage: p.coverImage,
    techStack: Array.isArray(p.techStack) ? (p.techStack as string[]) : [],
    category: p.category,
    featured: p.featured,
  }));

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr";
  const isFr = locale === "fr";
  const localePrefix = isFr ? "" : "/en";
  const homeName = isFr ? "Accueil" : "Home";

  const breadcrumbs = breadcrumbJsonLd([
    { name: homeName, url: `${baseUrl}${localePrefix}/` },
    { name: tNav("projects"), url: `${baseUrl}${localePrefix}/projects` },
  ]);

  const collectionLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("metaTitle"),
    url: `${baseUrl}${localePrefix}/projects`,
    description: t("metaDescription"),
    inLanguage: isFr ? "fr-FR" : "en-US",
    isPartOf: { "@type": "WebSite", name: "Léo Deroin", url: baseUrl },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: data.length,
      itemListElement: data.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${baseUrl}${localePrefix}/projects/${p.slug}`,
        name: p.title,
      })),
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-6 pt-32 pb-20">
      <header className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
          {t("kicker")}
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-slate-400">{t("intro")}</p>
      </header>

      {data.length === 0 ? (
        <p className="rounded-md border border-white/10 bg-cosmos-dark/40 p-8 text-center font-mono text-sm text-slate-500">
          {t("empty")}
        </p>
      ) : (
        <ProjectsGrid projects={data} />
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: collectionLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbs }} />
    </div>
  );
}
