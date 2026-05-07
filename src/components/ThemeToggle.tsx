"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

/**
 * Toggle thème clair / sombre.
 *
 * `mounted` évite le flash d'hydratation (next-themes ne connaît le thème
 * actif qu'après hydratation côté client). On rend un placeholder identique
 * pour réserver la place dans la nav et garder un layout stable.
 */
export function ThemeToggle() {
  const t = useTranslations("Common");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === "light";
  const next = isLight ? "dark" : "light";
  const label = isLight ? t("switchToDark") : t("switchToLight");

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-nebula-cyan/40 hover:text-nebula-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60"
    >
      {!mounted ? (
        <span className="h-4 w-4" aria-hidden />
      ) : isLight ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </button>
  );
}
