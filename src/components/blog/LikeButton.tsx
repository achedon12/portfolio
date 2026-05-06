"use client";

import { useEffect, useState } from "react";
import { Heart, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  slug: string;
  initialLikes: number;
  initialViews: number;
}

/**
 * Bloc engagement d'un article : compteur de vues (lecture seule) +
 * bouton coeur toggle anonyme (rate-limited côté API).
 *
 * - L'état initial `liked` est résolu après hydration via GET /api/blog/{slug}/like
 *   (l'IP hashée fait foi côté serveur, on s'aligne sur sa réponse).
 * - Mise à jour optimiste avec rollback si l'API renvoie une erreur.
 */
export function LikeButton({ slug, initialLikes, initialViews }: Props) {
  const safeLikes = initialLikes ?? 0;
  const safeViews = initialViews ?? 0;
  const [count, setCount] = useState(safeLikes);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/blog/${slug}/like`, { method: "GET" })
      .then((r) => r.json())
      .then((data: { liked: boolean; likeCount: number }) => {
        if (cancelled) return;
        setLiked(data.liked);
        setCount(data.likeCount);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function toggle() {
    if (loading) return;
    setLoading(true);

    const wasLiked = liked;
    const optimisticLiked = !wasLiked;
    setLiked(optimisticLiked);
    setCount((c) => c + (optimisticLiked ? 1 : -1));
    if (optimisticLiked) {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 350);
    }

    try {
      const res = await fetch(`/api/blog/${slug}/like`, { method: "POST" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { liked: boolean; likeCount: number };
      setLiked(data.liked);
      setCount(data.likeCount);
    } catch {
      setLiked(wasLiked);
      setCount((c) => c + (wasLiked ? 1 : -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-cosmos-dark/40 px-3 py-1.5 backdrop-blur-md">
      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-400">
        <Eye className="h-3.5 w-3.5" />
        {safeViews.toLocaleString()}
      </span>
      <span aria-hidden className="h-3 w-px bg-white/10" />
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        aria-pressed={liked}
        aria-label={liked ? "Retirer mon j'aime" : "J'aime cet article"}
        className={cn(
          "group inline-flex items-center gap-1.5 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 rounded",
          liked ? "text-rose-400" : "text-slate-400 hover:text-rose-300",
          loading && "opacity-60",
        )}
      >
        <motion.span
          animate={pulse ? { scale: [1, 1.4, 1] } : { scale: 1 }}
          transition={{ duration: 0.35 }}
          className="inline-flex"
        >
          <Heart
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              liked ? "fill-rose-400 text-rose-400" : "text-current group-hover:fill-rose-300/30",
            )}
          />
        </motion.span>
        {count.toLocaleString()}
      </button>
    </div>
  );
}
