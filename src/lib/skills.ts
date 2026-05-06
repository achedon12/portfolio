export type SkillCategory = "frontend" | "backend" | "devops" | "tools";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  /** Niveau de maîtrise — basé sur la fréquence d'usage et l'autonomie. */
  level: 1 | 2 | 3 | 4 | 5;
  /** Années d'utilisation effective (arrondi entier, min 1). */
  years: number;
  /** Position dans la constellation : x,y normalisés [-1, 1] */
  x: number;
  y: number;
  /** IDs des skills connectés (lignes de la constellation) */
  links?: string[];
}

export const categoryLabels: Record<SkillCategory, string> = {
  frontend: "Frontend",
  backend: "Backend",
  devops: "DevOps",
  tools: "Outils",
};

export const categoryColors: Record<SkillCategory, string> = {
  frontend: "#22d3ee",
  backend: "#7c3aed",
  devops: "#fb923c",
  tools: "#a3e635",
};

/**
 * Référentiel temporel — pour calculer les `years` au plus juste :
 *   - 2021 sept : début BUT Informatique → fondamentaux web (HTML/CSS/JS, Git, MySQL)
 *   - 2023 mars : stage Elipce → PHP / Doctrine arrivent
 *   - 2023 sept : alternance Elipce → React Native, Python, SCSS
 *   - 2024 août : alternance Confluent Digital → Next.js / Symfony / Phalcon / TypeScript / Tailwind / Keycloak / Docker quotidien
 *
 * Les années ci-dessous sont l'arrondi de l'écart entre le premier usage réel et aujourd'hui.
 */
export const skills: Skill[] = [
  { id: "html",   name: "HTML",         category: "frontend", level: 4, years: 5, x: 0.40, y: -0.10, links: ["css", "js"] },
  { id: "css",    name: "CSS",          category: "frontend", level: 4, years: 5, x: 0.55, y: -0.20, links: ["html", "tailwind"] },
  { id: "js",     name: "JavaScript",   category: "frontend", level: 4, years: 5, x: 0.70, y: -0.10, links: ["html", "ts", "react", "vue", "node"] },
  { id: "ts",     name: "TypeScript",   category: "frontend", level: 3, years: 2, x: 0.55, y: -0.38, links: ["js", "react", "next", "vue"] },
  { id: "react",  name: "React",        category: "frontend", level: 4, years: 3, x: 0.88, y: -0.30, links: ["next", "ts", "rn", "vite"] },
  { id: "next",   name: "Next.js",      category: "frontend", level: 4, years: 2, x: 0.95, y: -0.55, links: ["react", "ts", "node", "keycloak"] },
  { id: "vue",    name: "Vue 3",        category: "frontend", level: 4, years: 3, x: 0.40, y: -0.50, links: ["js", "ts", "vite"] },
  { id: "tailwind", name: "Tailwind",   category: "frontend", level: 4, years: 2, x: 0.72, y: -0.60, links: ["css", "react", "next", "vue"] },
  { id: "vite",   name: "Vite",         category: "frontend", level: 4, years: 2, x: 0.30, y: -0.65, links: ["react", "vue"] },
  { id: "rn",     name: "React Native", category: "frontend", level: 2, years: 2, x: 0.88, y: -0.78, links: ["react"] },

  { id: "php",      name: "PHP",        category: "backend", level: 4, years: 3, x: -0.55, y: -0.10, links: ["symfony", "phalcon", "laravel", "mysql"] },
  { id: "symfony",  name: "Symfony",    category: "backend", level: 3, years: 2, x: -0.85, y: -0.30, links: ["php", "doctrine"] },
  { id: "phalcon",  name: "Phalcon",    category: "backend", level: 4, years: 2, x: -0.72, y: -0.52, links: ["php", "mysql"] },
  { id: "laravel",  name: "Laravel",    category: "backend", level: 2, years: 2, x: -0.40, y: -0.42, links: ["php", "mysql"] },
  { id: "doctrine", name: "Doctrine",   category: "backend", level: 3, years: 2, x: -0.50, y:  0.05, links: ["symfony", "mysql"] },
  { id: "node",     name: "Node.js",    category: "backend", level: 3, years: 2, x: -0.28, y: -0.05, links: ["js", "express", "socket", "next"] },
  { id: "express",  name: "Express.js", category: "backend", level: 2, years: 1, x: -0.10, y:  0.30, links: ["node"] },
  { id: "socket",   name: "Socket.io",  category: "backend", level: 3, years: 1, x: -0.05, y:  0.10, links: ["node"] },
  { id: "mysql",    name: "MySQL",      category: "backend", level: 4, years: 4, x: -0.70, y:  0.25, links: ["doctrine", "phalcon", "prisma"] },
  { id: "postgres", name: "PostgreSQL", category: "backend", level: 2, years: 1, x: -0.85, y:  0.50, links: ["prisma"] },
  { id: "prisma",   name: "Prisma",     category: "backend", level: 3, years: 2, x: -0.45, y:  0.42, links: ["mysql", "postgres", "next"] },

  { id: "docker",   name: "Docker",     category: "devops", level: 4, years: 3, x:  0.05, y:  0.65, links: ["compose", "linux", "nginx"] },
  { id: "compose",  name: "Compose",    category: "devops", level: 4, years: 3, x: -0.18, y:  0.85, links: ["docker"] },
  { id: "linux",    name: "Linux",      category: "devops", level: 4, years: 3, x: -0.30, y:  0.65, links: ["docker", "nginx"] },
  { id: "nginx",    name: "Nginx",      category: "devops", level: 3, years: 2, x:  0.30, y:  0.78, links: ["docker", "linux"] },
  { id: "keycloak", name: "Keycloak",   category: "devops", level: 3, years: 2, x:  0.55, y:  0.55, links: ["next"] },

  { id: "git",     name: "Git",         category: "tools", level: 4, years: 5, x: -0.55, y: -0.78, links: ["github"] },
  { id: "github",  name: "GitHub",      category: "tools", level: 3, years: 5, x: -0.30, y: -0.88, links: ["git"] },
  { id: "figma",   name: "Figma",       category: "tools", level: 3, years: 3, x:  0.00, y: -0.88 },
];
