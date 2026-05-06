"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

declare global {
  interface Window {
    _paq?: unknown[];
  }
}

interface MatomoProps {
  /** URL de l'instance Matomo, ex: "https://matomo.leoderoin.fr" (avec ou sans slash final). */
  url: string;
  /** Identifiant du site dans Matomo (ex: "2"). */
  siteId: string;
}

/**
 * Tracker SPA : push un trackPageView à chaque changement de pathname (App Router).
 * useSearchParams nécessite un Suspense parent (Next 15+).
 */
function MatomoTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined" || !window._paq) return;
    const qs = searchParams?.toString();
    const fullPath = qs ? `${pathname}?${qs}` : pathname;
    window._paq.push(["setCustomUrl", fullPath]);
    window._paq.push(["setDocumentTitle", document.title]);
    window._paq.push(["trackPageView"]);
  }, [pathname, searchParams]);

  return null;
}

export function Matomo({ url, siteId }: MatomoProps) {
  // Normalise l'URL (ajoute un / final si absent).
  const trackerUrl = url.endsWith("/") ? url : `${url}/`;

  return (
    <>
      <Script
        id="matomo"
        strategy="afterInteractive"
      >{`
        var _paq = window._paq = window._paq || [];
        _paq.push(['enableLinkTracking']);
        (function() {
          var u="${trackerUrl}";
          _paq.push(['setTrackerUrl', u+'matomo.php']);
          _paq.push(['setSiteId', '${siteId}']);
          var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
          g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
        })();
      `}</Script>
      <Suspense fallback={null}>
        <MatomoTracker />
      </Suspense>
    </>
  );
}
