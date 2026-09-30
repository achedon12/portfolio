import { defineRouting } from "next-intl/routing";

/**
 * Routing i18n.
 *
 * `localePrefix: "as-needed"` :
 *   - FR (locale par défaut) → URLs sans préfixe : /, /projects, /blog
 *   - EN → URLs avec préfixe : /en, /en/projects, /en/blog
 *
 * Racine sans préfixe → langue du navigateur (voir `localeDetection`).
 *
 * Bonus : préserve les URLs FR existantes déjà indexées par Google et
 * permet d'ajouter des `<link rel="alternate" hreflang>` pour le SEO bilingue.
 */
export const routing = defineRouting({
  locales: ["fr", "en"] as const,
  defaultLocale: "fr",
  localePrefix: "as-needed",
  // Sans préfixe de langue dans l'URL, la langue du navigateur
  // (Accept-Language) décide : `/` redirige vers `/en` pour un navigateur
  // anglophone. Le cookie ne mémorise qu'un choix explicite fait via le
  // LocaleSwitcher. Il est renommé (ex-`NEXT_LOCALE`) pour que les anciens
  // cookies posés à chaque visite ne masquent plus la langue du navigateur.
  localeDetection: true,
  localeCookie: { name: "LD_LOCALE" },
});

export type Locale = (typeof routing.locales)[number];
