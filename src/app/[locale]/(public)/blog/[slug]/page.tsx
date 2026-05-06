import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Clock } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { mdxComponents } from "@/components/blog/MdxComponents";
import { ViewTracker } from "@/components/blog/ViewTracker";
import { LikeButton } from "@/components/blog/LikeButton";
import { CommentsSection } from "@/components/blog/CommentsSection";
import { mdxOptions } from "@/lib/mdx-options";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { breadcrumbJsonLd } from "@/lib/seo";
import { routing } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return routing.locales.flatMap((locale) =>
    posts.map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: locale === "fr" ? "Article introuvable" : "Article not found" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr";
  const isFr = locale === "fr";
  const localePrefix = isFr ? "" : "/en";
  const url = post.canonicalUrl ?? `${baseUrl}${localePrefix}/blog/${post.slug}`;
  const title = post.metaTitle ?? post.title;
  const description = post.metaDescription ?? post.description;
  const ogImage = post.ogImage ?? post.coverImage ?? undefined;

  return {
    title,
    description,
    keywords: post.metaKeywords ?? post.tags?.join(", "),
    alternates: {
      canonical: url,
      languages: {
        fr: `/blog/${post.slug}`,
        en: `/en/blog/${post.slug}`,
        "x-default": `/blog/${post.slug}`,
      },
    },
    robots: post.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
      images: ogImage ? [{ url: ogImage }] : undefined,
      locale: isFr ? "fr_FR" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("BlogPost");
  const tBlog = await getTranslations("Blog");

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = await getAllPosts();
  const idx = allPosts.findIndex((p) => p.slug === slug);
  const prev = idx >= 0 && idx < allPosts.length - 1 ? allPosts[idx + 1] : null;
  const next = idx > 0 ? allPosts[idx - 1] : null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.leoderoin.fr";
  const isFr = locale === "fr";
  const localePrefix = isFr ? "" : "/en";
  const homeName = isFr ? "Accueil" : "Home";
  const dateLocale = isFr ? "fr-FR" : "en-US";
  const fullUrl = post.canonicalUrl ?? `${baseUrl}${localePrefix}/blog/${post.slug}`;
  const ogImage = post.ogImage ?? post.coverImage;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: "Léo Deroin", url: baseUrl },
    publisher: { "@type": "Person", name: "Léo Deroin", url: baseUrl },
    image: ogImage ? [ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`] : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": fullUrl },
    url: fullUrl,
    keywords: post.metaKeywords ?? post.tags?.join(", "),
    inLanguage: isFr ? "fr-FR" : "en-US",
    wordCount: post.wordCount,
    articleSection: post.tags[0] ?? undefined,
    timeRequired: `PT${post.readingTime}M`,
  };

  const breadcrumbsLd = breadcrumbJsonLd([
    { name: homeName, url: `${baseUrl}${localePrefix}/` },
    { name: tBlog("title"), url: `${baseUrl}${localePrefix}/blog` },
    { name: post.title, url: fullUrl },
  ]);

  return (
    <article className="relative">
      <div className="mx-auto max-w-7xl px-6 pt-28 pb-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-400 transition-colors hover:text-nebula-cyan"
        >
          <ArrowLeft className="h-3 w-3" />
          {t("back")}
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_220px]">
          <div className="min-w-0 max-w-3xl">
            <header className="mb-10">
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-wider text-slate-500">
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString(dateLocale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {t("readingTime", { minutes: post.readingTime })}
                </span>
              </div>

              <h1 className="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl">
                {post.title}
              </h1>
              <p className="mt-4 text-lg text-slate-400">{post.description}</p>

              {post.tags && post.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="cyan">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <LikeButton
                  slug={post.slug}
                  initialLikes={post.likeCount}
                  initialViews={post.viewCount}
                />
              </div>
            </header>

            <ViewTracker slug={post.slug} />

            <div className="prose-cosmos">
              <MDXRemote
                source={post.content}
                components={mdxComponents}
                options={mdxOptions}
              />
            </div>

            <footer className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-white/5 pt-8">
              <ShareButtons url={fullUrl} title={post.title} />
              <Link
                href="/blog"
                className="font-mono text-xs uppercase tracking-wider text-slate-400 hover:text-nebula-cyan"
              >
                {t("viewAll")}
              </Link>
            </footer>

            <CommentsSection slug={post.slug} enabled={post.commentsEnabled} />

            {(prev || next) && (
              <nav className="mt-10 grid gap-3 md:grid-cols-2" aria-label={t("previous")}>
                {prev ? (
                  <Link
                    href={`/blog/${prev.slug}`}
                    className="group rounded-lg border border-white/10 bg-cosmos-dark/40 p-4 transition-colors hover:border-nebula-cyan/40"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                      ← {t("previous")}
                    </p>
                    <p className="mt-1 font-display text-sm font-medium text-slate-200 group-hover:text-nebula-cyan">
                      {prev.title}
                    </p>
                  </Link>
                ) : (
                  <span />
                )}
                {next ? (
                  <Link
                    href={`/blog/${next.slug}`}
                    className="group rounded-lg border border-white/10 bg-cosmos-dark/40 p-4 text-right transition-colors hover:border-nebula-cyan/40"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                      {t("next")} →
                    </p>
                    <p className="mt-1 font-display text-sm font-medium text-slate-200 group-hover:text-nebula-cyan">
                      {next.title}
                    </p>
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <TableOfContents entries={post.toc} />
            </div>
          </aside>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbsLd }}
      />
    </article>
  );
}
