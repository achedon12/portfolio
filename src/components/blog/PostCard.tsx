"use client";

import { ArrowUpRight, Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import type { PostMeta } from "@/lib/blog";

export function PostCard({ post }: { post: PostMeta }) {
  const locale = useLocale();
  const t = useTranslations("Blog");
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";

  return (
    <article className="group">
      <Link
        href={`/blog/${post.slug}`}
        className="block rounded-xl border border-white/10 bg-cosmos-dark/40 p-6 backdrop-blur-md transition-all hover:border-nebula-cyan/40 hover:shadow-[0_0_60px_rgba(34,211,238,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60"
      >
        <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-wider text-slate-500">
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString(dateLocale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {t("readingTime", { minutes: post.readingTime })}
          </span>
        </div>

        <h2 className="mt-3 font-display text-xl font-semibold text-slate-100 transition-colors group-hover:text-nebula-cyan">
          {post.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{post.description}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(post.tags ?? []).slice(0, 4).map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-500 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-nebula-cyan" />
        </div>
      </Link>
    </article>
  );
}
