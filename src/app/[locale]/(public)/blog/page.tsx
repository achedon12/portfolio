import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllPosts } from "@/lib/blog";
import { BlogIndexClient } from "@/components/blog/BlogIndexClient";
import { blogIndexJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; q?: string; tag?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === "fr";
  const localePrefix = isFr ? "" : "/en";

  const t = await getTranslations({ locale, namespace: "Blog" });

  const canonical = `${localePrefix}/blog`;
  const title = t("metaTitle");
  const description = t("metaDescription");
  const ogAlt = isFr ? "Léo Deroin — Carnets de bord" : "Léo Deroin — Logbook";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        fr: "/blog",
        en: "/en/blog",
        "x-default": "/blog",
      },
      types: { "application/rss+xml": "/blog/rss.xml" },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
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

export default async function BlogIndex({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");

  const sp = await searchParams;
  const initialQ = typeof sp.q === "string" ? sp.q : "";
  const initialTag = typeof sp.tag === "string" ? sp.tag : "";

  const allPosts = await getAllPosts();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr";
  const isFr = locale === "fr";
  const localePrefix = isFr ? "" : "/en";
  const homeName = isFr ? "Accueil" : "Home";

  const breadcrumbs = breadcrumbJsonLd([
    { name: homeName, url: `${baseUrl}${localePrefix}/` },
    { name: t("title"), url: `${baseUrl}${localePrefix}/blog` },
  ]);

  const blogLd = blogIndexJsonLd({
    url: `${baseUrl}${localePrefix}/blog`,
    posts: allPosts.map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      publishedAt: p.publishedAt,
    })),
  });

  return (
    <div className="mx-auto max-w-5xl px-6 pt-32 pb-20">
      <header className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
          {t("kicker")}
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-slate-400">{t("intro")}</p>
        <p className="mt-3">
          <a
            href="/blog/rss.xml"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-nebula-cyan hover:underline"
          >
            <span aria-hidden>📡</span> {t("rss")}
          </a>
        </p>
      </header>

      {allPosts.length === 0 ? (
        <p className="rounded-md border border-white/10 bg-cosmos-dark/40 p-8 text-center font-mono text-sm text-slate-500">
          {t("empty")}
        </p>
      ) : (
        <BlogIndexClient
          posts={allPosts}
          initialQ={initialQ}
          initialTag={initialTag}
        />
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: blogLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbs }} />
    </div>
  );
}
