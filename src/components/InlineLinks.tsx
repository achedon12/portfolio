import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

/**
 * Liens internes insérables dans les textes traduits via `t.rich()`.
 * Dans `src/messages/*.json`, un tag `<projects>la galerie</projects>`
 * devient un lien locale-aware vers `/projects`.
 *
 * Utilisable côté serveur (`getTranslations`) comme côté client
 * (`useTranslations`) : le `Link` de next-intl fonctionne dans les deux.
 */
const ROUTES = {
  home: "/",
  services: "/#services",
  about: "/#about",
  contact: "/#contact",
  projects: "/projects",
  blog: "/blog",
  uses: "/uses",
  now: "/now",
  lab: "/lab",
  newsletter: "/newsletter",
} as const;

type LinkTag = keyof typeof ROUTES;

export const inlineLinks = Object.fromEntries(
  Object.entries(ROUTES).map(([tag, href]) => [
    tag,
    (chunks: ReactNode) => (
      <Link href={href} className="inline-link">
        {chunks}
      </Link>
    ),
  ]),
) as Record<LinkTag, (chunks: ReactNode) => ReactNode>;
