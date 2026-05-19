"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Retire le préfixe de locale d'un pathname (`/en/foo` → `/foo`, `/en` → `/`).
 * Préserve les chemins déjà sans préfixe.
 */
function stripLocalePrefix(path: string): string {
  for (const l of routing.locales) {
    if (path === `/${l}`) return "/";
    if (path.startsWith(`/${l}/`)) return path.slice(l.length + 1);
  }
  return path;
}

/**
 * Construit l'URL cible pour une locale donnée en respectant `localePrefix: "as-needed"` :
 * la locale par défaut n'a jamais de préfixe.
 */
function buildLocalizedPath(basePath: string, target: Locale): string {
  if (target === routing.defaultLocale) return basePath;
  if (basePath === "/") return `/${target}`;
  return `/${target}${basePath}`;
}

export function LocaleSwitcher() {
  const t = useTranslations("Common");
  const router = useRouter();
  const rawPathname = usePathname();
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  function setLocale(next: Locale) {
    if (next === locale) return;
    const basePath = stripLocalePrefix(rawPathname);
    const target = buildLocalizedPath(basePath, next);
    startTransition(() => {
      router.replace(target);
    });
  }

  return (
    <div
      role="group"
      aria-label="Locale"
      className={cn(
        "flex items-center gap-0.5 rounded-md border border-white/10 bg-white/5 p-0.5 font-mono text-[10px] uppercase tracking-wider",
        isPending && "opacity-60",
      )}
    >
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            aria-label={l === "fr" ? t("switchToFr") : t("switchToEn")}
            aria-current={active}
            onClick={() => setLocale(l)}
            className={cn(
              "rounded px-2 py-1 transition-colors",
              active ? "bg-nebula-cyan/20 text-nebula-cyan" : "text-slate-400 hover:text-slate-200",
            )}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
