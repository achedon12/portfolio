import { defineRouting } from "next-intl/routing";

/**
 * Routing i18n.
 *
 * `localePrefix: "as-needed"` :
 *   - FR (locale par défaut) → URLs sans préfixe : /, /projects, /blog
 *   - EN → URLs avec préfixe : /en, /en/projects, /en/blog
 *
 * Bonus : préserve les URLs FR existantes déjà indexées par Google et
 * permet d'ajouter des `<link rel="alternate" hreflang>` pour le SEO bilingue.
 */
export const routing = defineRouting({
  locales: ["fr", "en"] as const,
  defaultLocale: "fr",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
