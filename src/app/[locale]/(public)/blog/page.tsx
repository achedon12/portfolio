import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllPosts } from "@/lib/blog";
import { PostCard } from "@/components/blog/PostCard";
import { cn } from "@/lib/utils";
import { blogIndexJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 60;

const PAGE_SIZE = 6;

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const isFr = locale === "fr";
  const localePrefix = isFr ? "" : "/en";

  const t = await getTranslations({ locale, namespace: "Blog" });

  const canonical =
    page === 1 ? `${localePrefix}/blog` : `${localePrefix}/blog?page=${page}`;

  return {
    title: page === 1 ? t("metaTitle") : t("metaTitlePage", { page }),
    description: t("metaDescription"),
    alternates: {
      canonical,
      languages: {
        fr: page === 1 ? "/blog" : `/blog?page=${page}`,
        en: page === 1 ? "/en/blog" : `/en/blog?page=${page}`,
        "x-default": page === 1 ? "/blog" : `/blog?page=${page}`,
      },
      types: { "application/rss+xml": "/blog/rss.xml" },
    },
    openGraph: {
      title: page === 1 ? t("metaTitle") : t("metaTitlePage", { page }),
      description: t("metaDescription"),
      type: "website",
      url: canonical,
      locale: isFr ? "fr_FR" : "en_US",
    },
  };
}

export default async function BlogIndex({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { page: pageParam } = await searchParams;
  const t = await getTranslations("Blog");

  const allPosts = await getAllPosts();
  const totalPages = Math.max(1, Math.ceil(allPosts.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, Number(pageParam ?? 1) || 1), totalPages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const posts = allPosts.slice(start, start + PAGE_SIZE);

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

      {posts.length === 0 ? (
        <p className="rounded-md border border-white/10 bg-cosmos-dark/40 p-8 text-center font-mono text-sm text-slate-500">
          {t("empty")}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            const active = page === currentPage;
            return (
              <Link
                key={page}
                href={page === 1 ? "/blog" : `/blog?page=${page}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "h-9 min-w-9 rounded-md border px-3 text-sm font-mono transition-colors flex items-center justify-center",
                  active
                    ? "border-nebula-cyan/60 bg-nebula-cyan/10 text-nebula-cyan"
                    : "border-white/10 bg-white/5 text-slate-400 hover:text-slate-200",
                )}
              >
                {page}
              </Link>
            );
          })}
        </nav>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: blogLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbs }} />
    </div>
  );
}
