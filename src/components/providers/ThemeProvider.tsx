"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Wrapper next-themes avec convention class-based :
 *   - <html class="dark">   → thème par défaut, palette cosmos
 *   - <html class="light">  → off-white doux teinté violet (cf. globals.css `.light`)
 *
 * `defaultTheme="dark"` parce que le portfolio est dark-first.
 * `enableSystem={false}` : on respecte le choix utilisateur, pas le pref OS,
 * pour que le toggle ait toujours un effet visible.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
