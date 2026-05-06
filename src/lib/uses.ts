/**
 * Données de la page /uses.
 * `fr` / `en` : description courte localisée. `name` reste universel (techno, marque).
 *
 * Mettre à jour quand tu changes ton setup — version, OS, extension, etc.
 */
export interface UseItem {
  name: string;
  fr?: string;
  en?: string;
  url?: string;
}

export interface UseSection {
  id: SectionId;
  items: UseItem[];
}

export type SectionId =
  | "editor"
  | "hardware"
  | "os"
  | "terminal"
  | "browser"
  | "browserExtensions"
  | "stack"
  | "tools"
  | "apps";

/** Date de dernière mise à jour manuelle (à bumper quand tu édites le contenu). */
export const USES_LAST_UPDATED = "2026-05-06";

export const uses: UseSection[] = [
  {
    id: "editor",
    items: [
      {
        name: "PhpStorm",
        fr: "Éditeur unique pour tout — PHP / Symfony / Phalcon / Doctrine côté back, et TypeScript / React / Next / Vue côté front",
        en: "Single editor for everything — PHP / Symfony / Phalcon / Doctrine on the backend, and TypeScript / React / Next / Vue on the frontend",
      },
    ],
  },
  {
    id: "hardware",
    items: [
      {
        name: "Dell Inspiron 7791 2-in-1",
        fr: "Intel Core i7-10510U · 16 Go RAM · 8 cœurs",
        en: "Intel Core i7-10510U · 16 GB RAM · 8 cores",
      },
    ],
  },
  {
    id: "os",
    items: [
      {
        name: "Xubuntu 24.04 LTS (Noble Numbat)",
        fr: "Xfce 4.18 · noyau Linux 6.8 — léger, stable, jamais dans le chemin",
        en: "Xfce 4.18 · Linux kernel 6.8 — light, stable, stays out of the way",
      },
    ],
  },
  {
    id: "terminal",
    items: [
      { name: "xfce4-terminal", fr: "Terminal par défaut de Xfce", en: "Xfce default terminal" },
      { name: "bash 5.2", fr: "Shell par défaut, sans fioritures", en: "Default shell, no frills" },
      { name: "Git 2.43" },
      { name: "Node.js 22 + npm 10" },
      { name: "Docker 29 + Compose v2" },
    ],
  },
  {
    id: "browser",
    items: [
      {
        name: "Google Chrome",
        fr: "Navigateur principal pour le quotidien et les DevTools",
        en: "Main browser for daily use and DevTools",
      },
    ],
  },
  {
    id: "browserExtensions",
    items: [
      {
        name: "Fake Filler",
        url: "https://fakefiller.com/",
        fr: "Remplit tous les champs d'un form en un clic — gain de temps énorme en dev",
        en: "Fills every field of a form with one click — massive dev time saver",
      },
      {
        name: "Wappalyzer",
        url: "https://www.wappalyzer.com/",
        fr: "Identifie la stack derrière n'importe quel site (CMS, framework, analytics, hébergeur)",
        en: "Detects the stack behind any site (CMS, framework, analytics, hosting)",
      },
      {
        name: "KeePassXC-Browser",
        url: "https://keepassxc.org/",
        fr: "Auto-remplissage des credentials depuis KeePassXC, sans cloud",
        en: "Auto-fills credentials from KeePassXC, no cloud involved",
      },
    ],
  },
  {
    id: "stack",
    items: [
      {
        name: "Next.js + React + TypeScript",
        fr: "Ma stack par défaut côté front et fullstack",
        en: "My default stack for frontend and fullstack work",
      },
      {
        name: "Symfony + PHP 8",
        fr: "Pour les backends qui doivent durer",
        en: "For backends built to last",
      },
      {
        name: "Phalcon",
        fr: "Stack interne chez Confluent Digital",
        en: "Internal stack at Confluent Digital",
      },
      {
        name: "Vue 3",
        fr: "Quand un projet me le demande, ou pour casser la routine",
        en: "When a project calls for it, or just to switch things up",
      },
      {
        name: "Tailwind CSS",
        fr: "Sur la quasi-totalité de mes projets perso",
        en: "On nearly every personal project",
      },
      {
        name: "Prisma + MySQL / PostgreSQL",
        fr: "ORM + DB par défaut",
        en: "ORM + DB by default",
      },
      {
        name: "Three.js + GSAP + Framer Motion",
        fr: "Pour les démos visuelles et l'animation web",
        en: "For visual demos and web animation",
      },
    ],
  },
  {
    id: "tools",
    items: [
      { name: "ffmpeg", fr: "Audio / vidéo, scriptable", en: "Audio / video, scriptable" },
      { name: "Prisma CLI", fr: "Migrations, seed, studio", en: "Migrations, seed, studio" },
      {
        name: "openssl",
        fr: "Génération de secrets, hash, certificats",
        en: "Secret generation, hashing, certificates",
      },
    ],
  },
  {
    id: "apps",
    items: [
      {
        name: "KeePassXC",
        url: "https://keepassxc.org/",
        fr: "Gestionnaire de mots de passe local, format KDBX",
        en: "Local password manager, KDBX format",
      },
    ],
  },
];
