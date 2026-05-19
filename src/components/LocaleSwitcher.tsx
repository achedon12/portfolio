"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const t = useTranslations("Common");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  function setLocale(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
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
