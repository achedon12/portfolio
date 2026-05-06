export type TimelineKind =
  | "education"
  | "apprenticeship"
  | "internship"
  | "student"
  | "job"
  | "freelance";

export interface TimelineStep {
  id: string;
  kind: TimelineKind;
  /** ISO month "YYYY-MM" */
  from: string;
  /** ISO month "YYYY-MM" or "present" */
  to: string;
  /** Ville / format libre */
  location?: string;
  stack?: string[];
}

/**
 * Données factuelles uniquement — les libellés (title, org, description, kind)
 * sont traduits côté composant via la clé `id` de la timeline.
 *
 * Source : profil LinkedIn de Léo Deroin.
 * Ordre du plus récent au plus ancien.
 */
export const timeline: TimelineStep[] = [
  {
    id: "confluent-digital",
    kind: "apprenticeship",
    from: "2024-08",
    to: "present",
    location: "Lyon",
    stack: ["Next.js", "Symfony", "MySQL", "Docker", "TypeScript"],
  },
  {
    id: "esgi-master",
    kind: "education",
    from: "2024-07",
    to: "2026-07",
    stack: ["Next.js", "Express.js"],
  },
  {
    id: "elipce-apprenticeship",
    kind: "apprenticeship",
    from: "2023-09",
    to: "2024-07",
    location: "Valence",
    stack: ["React Native", "Expo", "PHP", "Python", "JavaScript", "SCSS"],
  },
  {
    id: "uga-but",
    kind: "education",
    from: "2021-09",
    to: "2024-07",
    stack: ["Vue.js"],
  },
  {
    id: "elipce-internship",
    kind: "internship",
    from: "2023-03",
    to: "2023-06",
    location: "Valence",
    stack: ["PHP"],
  },
  {
    id: "la-poste",
    kind: "student",
    from: "2022-10",
    to: "2023-04",
    location: "Valence",
  },
  {
    id: "lpo-monge",
    kind: "education",
    from: "2018-09",
    to: "2021-06",
  },
];

/** Format "YYYY-MM" as localized "Month YYYY" string. */
export function formatMonth(iso: string, locale: string, presentLabel: string): string {
  if (iso === "present") return presentLabel;
  const [y, m] = iso.split("-");
  if (!y || !m) return iso;
  const date = new Date(Number(y), Number(m) - 1, 1);
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(".", "");
}
