import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDev = process.env.NODE_ENV !== "production";

// Origine Matomo (script + beacon) autorisée par la CSP. Inlinée au build,
// comme les autres NEXT_PUBLIC_*.
const matomoOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_MATOMO_URL
      ? new URL(process.env.NEXT_PUBLIC_MATOMO_URL).origin
      : "";
  } catch {
    return "";
  }
})();

/**
 * CSP volontairement pragmatique : `'unsafe-inline'` reste nécessaire pour
 * les scripts inline de Next (hydratation, JSON-LD, snippet Matomo) sans
 * passer toutes les pages en rendu dynamique avec un nonce. Les directives
 * utiles contre l'injection / le clickjacking (object-src, base-uri,
 * form-action, frame-ancestors) sont, elles, verrouillées.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${matomoOrigin}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${matomoOrigin}${isDev ? " ws:" : ""}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
]
  .map((d) => d.replace(/\s+/g, " ").trim())
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // HSTS n'est pris en compte par les navigateurs qu'en HTTPS : sans effet en local.
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  // Ne pas annoncer "X-Powered-By: Next.js" (empreinte logicielle).
  poweredByHeader: false,
  images: {
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // /cv (FR + EN) → PDF dans /public. URL courte partageable.
      { source: "/cv", destination: "/leo-deroin-cv.pdf", permanent: false },
      { source: "/en/cv", destination: "/leo-deroin-cv.pdf", permanent: false },
    ];
  },
};

export default withNextIntl(nextConfig);
