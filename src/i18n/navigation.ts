import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Wrappers around Next.js navigation primitives that automatically prepend
 * the locale segment when needed (`/en/projects` for EN, `/projects` for FR).
 *
 * À importer à la place de `next/link` / `next/navigation` dans le code public.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
