import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
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
