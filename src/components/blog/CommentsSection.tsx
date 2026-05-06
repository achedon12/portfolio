"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MessageSquare } from "lucide-react";
import { CommentForm } from "@/components/blog/CommentForm";

interface Comment {
  id: number;
  pseudo: string;
  message: string;
  createdAt: string;
}

interface Props {
  slug: string;
  enabled: boolean;
}

/**
 * Section commentaires sous l'article.
 * - Charge les commentaires `approved` au montage via /api/blog/{slug}/comments
 * - Si `enabled=false`, affiche un message neutre et ne charge ni form ni liste
 * - React échappe automatiquement le HTML, pas besoin de DOMPurify ici
 */
export function CommentsSection({ slug, enabled }: Props) {
  const t = useTranslations("Comments");
  const locale = useLocale();
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch(`/api/blog/${slug}/comments`)
      .then((r) => r.json())
      .then((data: { comments: Comment[] }) => {
        if (!cancelled) setComments(data.comments);
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, enabled, reloadFlag]);

  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";

  return (
    <section aria-label={t("title")} className="mt-16 border-t border-white/5 pt-10">
      <h2 className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.4em] text-nebula-cyan">
        <MessageSquare className="h-3.5 w-3.5" />
        {t("title")}
        {comments !== null && comments.length > 0 && (
          <span className="rounded-full bg-nebula-cyan/10 px-2 py-0.5 text-[10px] text-nebula-cyan">
            {comments.length}
          </span>
        )}
      </h2>

      {!enabled ? (
        <p className="rounded-md border border-white/10 bg-cosmos-dark/40 p-4 text-center font-mono text-xs text-slate-500">
          {t("disabled")}
        </p>
      ) : (
        <div className="space-y-8">
          {comments === null ? (
            <p className="font-mono text-xs text-slate-500">{t("loading")}</p>
          ) : comments.length === 0 ? (
            <p className="rounded-md border border-white/10 bg-cosmos-dark/30 p-4 text-center font-mono text-xs text-slate-500">
              {t("empty")}
            </p>
          ) : (
            <ul className="space-y-4">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-lg border border-white/10 bg-cosmos-dark/30 p-4"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-display text-sm font-semibold text-slate-100">
                      {c.pseudo}
                    </p>
                    <time
                      dateTime={c.createdAt}
                      className="font-mono text-[10px] uppercase tracking-wider text-slate-500"
                    >
                      {new Date(c.createdAt).toLocaleString(dateLocale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                    {c.message}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div>
            <CommentForm slug={slug} onSubmitted={() => setReloadFlag((n) => n + 1)} />
          </div>
        </div>
      )}
    </section>
  );
}
