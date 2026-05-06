export const profile = {
  name: "Léo Deroin",
  shortName: "Léo",
  role: "Développeur Fullstack",
  tagline: "Explorateur du web",
  /** Affiché tel quel dans l'UI (footer, fiche about). */
  location: "Lyon, France",
  /** Adresse structurée pour JSON-LD / SEO local. */
  address: {
    locality: "Lyon",
    region: "Auvergne-Rhône-Alpes",
    country: "FR",
  },
  email: "contact@leoderoin.fr",
  links: {
    github: "https://github.com/achedon12",
    linkedin: "https://www.linkedin.com/in/leo-deroin/",
    malt: "https://www.malt.fr/profile/leoderoin",
  },
  bio: [
    "Développeur fullstack basé à Lyon, passionné par les interfaces qui sortent du cadre — celles qui te font rester sur une page parce qu'il s'y passe quelque chose.",
    "Je travaille principalement sur la stack PHP/Symfony et JS/TS (React, Next.js, Vue 3), du back robuste à l'expérience front soignée. J'aime quand un projet a une raison d'exister, pas juste un cahier des charges.",
    "En alternance chez Confluent Digital à Lyon, je construis des outils SaaS pour des PME et je passe trop de temps à animer des shaders.",
  ],
  /** Compétences clés pour le `knowsAbout` du Person JSON-LD. Boost SEO sémantique. */
  knowsAbout: [
    "Développement web",
    "Next.js",
    "React",
    "TypeScript",
    "Vue.js",
    "Symfony",
    "Phalcon",
    "PHP",
    "Node.js",
    "MySQL",
    "PostgreSQL",
    "Prisma",
    "Tailwind CSS",
    "Three.js",
    "Docker",
    "Linux",
  ],
  /** Mots-clés FR optimisés pour la recherche locale. */
  searchKeywords: [
    "développeur fullstack lyon",
    "développeur web lyon",
    "freelance développeur lyon",
    "développeur next.js lyon",
    "développeur symfony lyon",
    "développeur react lyon",
    "léo deroin",
    "leoderoin",
    "développeur php lyon",
    "développeur fullstack auvergne-rhône-alpes",
  ],
} as const;

const CAREER_START_YEAR = 2023;

export function getYearsOfExperience(): number {
  return Math.max(1, new Date().getFullYear() - CAREER_START_YEAR);
}

export type StatKey = "yearsOfExperience" | "projectsDelivered" | "techMastered";

export interface ProfileStat {
  key: StatKey;
  value: number;
  suffix: string;
}

/** Calcule les stats à chaque appel : les années d'XP suivent l'année courante. */
export function getStats(): ProfileStat[] {
  return [
    { key: "yearsOfExperience", value: getYearsOfExperience(), suffix: "" },
    { key: "projectsDelivered", value: 40, suffix: "+" },
    { key: "techMastered", value: 25, suffix: "" },
  ];
}
