import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Léo Deroin — Développeur Fullstack à Lyon",
    short_name: "Léo Deroin",
    description:
      "Portfolio de Léo Deroin, développeur fullstack basé à Lyon. Next.js, React, Symfony, Vue.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "browser"],
    orientation: "portrait-primary",
    background_color: "#030014",
    theme_color: "#030014",
    lang: "fr",
    dir: "ltr",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png", purpose: "any" },
      { src: "/icon0", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon1", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon1", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
    categories: ["portfolio", "developer", "technology"],
    shortcuts: [
      {
        name: "Projets",
        short_name: "Projets",
        description: "Galerie des projets et missions",
        url: "/projects",
        icons: [{ src: "/icon0", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Carnets de bord",
        short_name: "Blog",
        description: "Articles, notes et retours d'expérience",
        url: "/blog",
        icons: [{ src: "/icon0", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Contact",
        short_name: "Contact",
        description: "Ouvrir un canal de communication",
        url: "/#contact",
        icons: [{ src: "/icon0", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
