import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Léo Deroin — Développeur fullstack à Besançon",
    short_name: "Léo Deroin",
    description:
      "Portfolio de Léo Deroin, développeur fullstack basé à Besançon. Next.js, React, Symfony, Vue.",
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
      // Générées depuis public/logo-mark.svg par `npm run logos`.
      { src: "/logo-mark-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo-mark-384.png", sizes: "384x384", type: "image/png", purpose: "any" },
      { src: "/logo-mark-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/logo-mark-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["portfolio", "developer", "technology"],
    shortcuts: [
      {
        name: "Projets",
        short_name: "Projets",
        description: "Galerie des projets et missions",
        url: "/projects",
        icons: [{ src: "/logo-mark-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Carnets de bord",
        short_name: "Blog",
        description: "Articles, notes et retours d'expérience",
        url: "/blog",
        icons: [{ src: "/logo-mark-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Contact",
        short_name: "Contact",
        description: "Ouvrir un canal de communication",
        url: "/#contact",
        icons: [{ src: "/logo-mark-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
