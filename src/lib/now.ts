/**
 * Données pour la page /now — style nownownow.com.
 *
 * Cette page reflète ce sur quoi je passe mon temps **en ce moment**, pas
 * un CV. Elle est volontairement courte et tenue à jour à la main.
 *
 * Pour mettre à jour : édite les arrays ci-dessous + remonte
 * `NOW_LAST_UPDATED` à la date du jour (format ISO YYYY-MM-DD).
 */

export const NOW_LAST_UPDATED = "2026-09-30";

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
    key: "job-search",
    fr: "Recherche d'un CDI de développeur fullstack, depuis Besançon — stack PHP / Symfony, Next.js / React, Vue.",
    en: "Looking for a full-time fullstack developer role, from Besançon — PHP / Symfony, Next.js / React, Vue stack.",
    category: "main",
  },
  {
    key: "graduated",
    fr: "Fin de l'alternance chez Confluent Digital et du Master Ingénierie du web à l'ESGI (septembre 2026), après deux ans à livrer des outils SaaS pour des PME.",
    en: "Wrapped up the Confluent Digital apprenticeship and the Master's in Web Engineering at ESGI (September 2026), after two years shipping SaaS tools for SMBs.",
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
