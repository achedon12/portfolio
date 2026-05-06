import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Léo Deroin — Développeur Fullstack à Lyon",
    short_name: "Léo Deroin",
    description:
      "Portfolio de Léo Deroin, développeur fullstack basé à Lyon. Next.js, React, Symfony, Vue.",
    start_url: "/",
    display: "standalone",
    background_color: "#030014",
    theme_color: "#030014",
    lang: "fr",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
    categories: ["portfolio", "developer", "technology"],
  };
}
