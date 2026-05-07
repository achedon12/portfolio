import { ArrowUpRight, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import type { PostMeta } from "@/lib/blog";

interface RelatedPostsProps {
  posts: PostMeta[];
  locale: string;
}

export async function RelatedPosts({ posts, locale }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "BlogPost" });
  const tBlog = await getTranslations({ locale, namespace: "Blog" });
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";

  return (
    <section className="mt-16 border-t border-white/5 pt-10" aria-labelledby="related-heading">
      <h2
        id="related-heading"
        className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-nebula-cyan"
      >
        ◊ {t("related")}
      </h2>
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group block h-full rounded-lg border border-white/10 bg-cosmos-dark/40 p-5 transition-all hover:border-nebula-cyan/40 hover:shadow-[0_0_40px_rgba(34,211,238,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60"
            >
              <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString(dateLocale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {tBlog("readingTime", { minutes: post.readingTime })}
                </span>
              </div>

              <h3 className="mt-3 font-display text-base font-semibold text-slate-100 transition-colors group-hover:text-nebula-cyan">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-slate-400">{post.description}</p>

              {post.tags && post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="default">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <span
                aria-hidden
                className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 transition-colors group-hover:text-nebula-cyan"
              >
                {t("readArticle")}
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
