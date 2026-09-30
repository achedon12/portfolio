import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

/** Tags `<projects>…</projects>` des messages → liens internes, via `t.rich(key, inlineLinks)`. */
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
