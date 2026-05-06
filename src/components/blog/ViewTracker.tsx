"use client";

import { useEffect } from "react";

/**
 * Composant invisible — déclenche un POST /api/blog/{slug}/view au montage.
 * Le serveur gère le rate-limit (1/IP/jour). Une seule requête par session
 * grâce à un flag sessionStorage pour éviter de recompter sur navigation interne.
 */
export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch(`/api/blog/${slug}/view`, { method: "POST", keepalive: true }).catch(() => {});
  }, [slug]);
  return null;
}
