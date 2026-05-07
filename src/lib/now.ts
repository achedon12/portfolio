/**
 * Données pour la page /now — style nownownow.com.
 *
 * Cette page reflète ce sur quoi je passe mon temps **en ce moment**, pas
 * un CV. Elle est volontairement courte et tenue à jour à la main.
 *
 * Pour mettre à jour : édite les arrays ci-dessous + remonte
 * `NOW_LAST_UPDATED` à la date du jour (format ISO YYYY-MM-DD).
 */

export const NOW_LAST_UPDATED = "2026-05-07";

export interface NowItem {
  /** Clé stable, sert au key React. */
  key: string;
  /** Texte FR (langue source). */
  fr: string;
  /** Texte EN — fallback FR si absent. */
  en?: string;
  /** Lien externe optionnel. */
  url?: string;
}

export interface NowFocusItem extends NowItem {
  category: "main" | "side";
}

/** Activités principales et secondaires du moment. */
export const nowFocus: NowFocusItem[] = [
  {
    key: "confluent",
    fr: "Alternance fullstack chez Confluent Digital à Lyon — conception et développement d'outils SaaS pour des PME, stack PHP / Symfony / Next.js.",
    en: "Fullstack apprenticeship at Confluent Digital in Lyon — designing and shipping SaaS tools for SMBs, PHP / Symfony / Next.js stack.",
    category: "main",
  },
  {
    key: "esgi",
    fr: "Master Ingénierie du web à l'ESGI, en alternance — spécialisation architectures web modernes.",
    en: "Master's in Web Engineering at ESGI, on a work-study program — focused on modern web architectures.",
    category: "main",
  },
  {
    key: "portfolio",
    fr: "Refonte complète de ce portfolio (Next.js 16, React 19, R3F, GSAP) — thème voyage spatial, bilingue, PWA.",
    en: "Full rewrite of this portfolio (Next.js 16, React 19, R3F, GSAP) — space-voyage theme, bilingual, PWA.",
    category: "side",
    url: "https://github.com/achedon12",
  },
];

/** Lectures, podcasts, vidéos — à compléter quand quelque chose marque. */
export const nowReading: NowItem[] = [
  // Exemple :
  // { key: "designing-data", fr: "Designing Data-Intensive Applications, M. Kleppmann", en: "Designing Data-Intensive Applications by M. Kleppmann" },
];

/** Évolutions du setup hardware/software — pointe vers /uses pour la liste complète. */
export const nowSetupChanges: NowItem[] = [
  // Exemple :
  // { key: "switch-pnpm", fr: "Bascule npm → pnpm sur les projets perso, gain disque significatif." },
];
