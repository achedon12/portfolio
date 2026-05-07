"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { PostCard } from "@/components/blog/PostCard";
import type { PostMeta } from "@/lib/blog";

/**
 * Strip accents + lowercase for diacritic-insensitive matching.
 * "Décomposition" → "decomposition", so "deco" matches "Décomposition".
 */
function normalize(input: string): string {
  return input.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function matchesQuery(post: PostMeta, q: string): boolean {
  if (!q) return true;
  const haystack = normalize(`${post.title} ${post.description} ${post.tags.join(" ")}`);
  return normalize(q)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

interface TagCount {
  tag: string;
  count: number;
}

function collectTagCounts(posts: PostMeta[]): TagCount[] {
  const counts = new Map<string, number>();
  posts.forEach((p) => {
    p.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1));
  });
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

interface BlogIndexClientProps {
  posts: PostMeta[];
  initialQ?: string;
  initialTag?: string;
}

export function BlogIndexClient({
  posts,
  initialQ = "",
  initialTag = "",
}: BlogIndexClientProps) {
  const t = useTranslations("Blog");
  const router = useRouter();

  const [q, setQ] = useState(initialQ);
  const [tag, setTag] = useState(initialTag);
  const isFirstSync = useRef(true);

  // Sync local state → URL (debounced for query). Skip on the very first
  // render to keep the URL clean if the user lands on /blog without filters.
  useEffect(() => {
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (tag) params.set("tag", tag);
      const qs = params.toString();
      const url = qs ? `?${qs}` : window.location.pathname;
      router.replace(url, { scroll: false });
    }, 250);
    return () => clearTimeout(timer);
  }, [q, tag, router]);

  const tagsWithCounts = useMemo(() => collectTagCounts(posts), [posts]);

  const filtered = useMemo(
    () => posts.filter((p) => matchesQuery(p, q) && (tag === "" || p.tags.includes(tag))),
    [posts, q, tag],
  );

  const hasFilter = q !== "" || tag !== "";

  return (
    <>
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchAria")}
            className="flex h-10 w-full rounded-md border border-white/10 bg-cosmos-dark/40 pl-10 pr-9 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-500 backdrop-blur-sm focus-visible:border-nebula-cyan/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/30"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label={t("searchClear")}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {tagsWithCounts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTag("")}
              aria-pressed={tag === ""}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60",
                tag === ""
                  ? "border-nebula-cyan/60 bg-nebula-cyan/10 text-nebula-cyan"
                  : "border-white/10 bg-white/5 text-slate-400 hover:text-slate-200",
              )}
            >
              {t("allTags")} ({posts.length})
            </button>
            {tagsWithCounts.map(({ tag: tagName, count }) => (
              <button
                key={tagName}
                type="button"
                onClick={() => setTag(tag === tagName ? "" : tagName)}
                aria-pressed={tag === tagName}
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60",
                  tag === tagName
                    ? "border-nebula-cyan/60 bg-nebula-cyan/10 text-nebula-cyan"
                    : "border-white/10 bg-white/5 text-slate-400 hover:text-slate-200",
                )}
              >
                {tagName} ({count})
              </button>
            ))}
          </div>
        )}

        {hasFilter && (
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            {t("resultsCount", { count: filtered.length })}
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-md border border-white/10 bg-cosmos-dark/40 p-8 text-center font-mono text-sm text-slate-500">
          {t("noResults")}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
