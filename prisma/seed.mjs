import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn("[seed] ADMIN_EMAIL or ADMIN_PASSWORD missing — skipping admin bootstrap");
    return;
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed] admin already exists (${email}), no-op`);
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  await prisma.adminUser.create({ data: { email, password: hash } });
  console.log(`[seed] admin created: ${email}`);
}


const PROJECTS = [
  {
    slug: "werewolf",
    title: "Loup-Garou en Ligne",
    description:
      "Jeu de Loup-Garou multijoueur temps réel : jusqu'à 18 joueurs par partie, 16 rôles avec leurs capacités uniques. Stack Next 15 / React 19 / Socket.io / PostgreSQL / Docker.",
    longContent:
      "Application web temps réel du célèbre jeu de société Loup-Garou (Werewolf). Une partie peut accueillir jusqu'à 18 joueurs simultanés, avec une orchestration des phases (jour / nuit) entièrement gérée côté serveur via Socket.io.\n\nLe jeu inclut 16 rôles différents avec leurs capacités propres : Loup-Garou, Voyante, Sorcière, Chasseur, Cupidon, Salvateur, Petite Fille, Sœur, Servante Dévouée, Enfant Sauvage, Renard, Montreur d'Ours, Villageois, Loup-Garou Blanc, Voleur. Chaque rôle a sa logique métier dédiée côté back et son rendu côté front, avec des configurations de partie personnalisables.\n\nCôté technique : Next 15 + React 19 pour le front, Tailwind 4 + DaisyUI pour l'UI. Le moteur temps réel tourne sur Node.js + Socket.io et persiste en PostgreSQL via Prisma. Authentification JWT + bcrypt, envoi d'emails (reset password, notifications) via Nodemailer, validation Zod côté serveur. Tableau de bord statistiques avec Chart.js et Recharts.\n\nLe tout est conteneurisé en Docker, déployé en prod sur werewolf.leoderoin.fr derrière Nginx, avec un bot Discord compagnon pour organiser les parties dans le serveur communautaire.",
    coverImage: "/projects/werewolf.jpg",
    techStack: [
      "Next.js",
      "React",
      "Socket.io",
      "Node.js",
      "PostgreSQL",
      "Prisma",
      "Tailwind",
      "DaisyUI",
      "JWT",
      "Nodemailer",
      "Zod",
      "Docker",
    ],
    category: "école",
    liveUrl: "https://werewolf.leoderoin.fr",
    githubUrl: "https://github.com/achedon12/werewolf",
    featured: true,
  },
  {
    slug: "goldrush",
    title: "Goldrush",
    description:
      "Serveur Minecraft Bedrock sur le thème de la conquête de l'ouest, lancé en 2021 et reconduit avec succès sur plusieurs saisons.",
    longContent:
      "Goldrush est un serveur de jeu Minecraft sur la version Bedrock du jeu. L'univers du serveur est basé sur la conquête de l'ouest. Le projet a commencé en 2021 et a connu un grand succès à travers plusieurs versions.\n\nÀ côté du gameplay, la communauté GoldRush-developpement maintient les outils web autour du serveur (site, panel d'administration, dashboard joueurs).",
    coverImage: "/projects/goldrush.png",
    techStack: ["Laravel", "Vue.js", "PHP", "MySQL", "Docker", "CSS", "Figma", "Git"],
    category: "perso",
    liveUrl: null,
    githubUrl: "https://github.com/GoldRush-developpement/",
    featured: true,
  },
  {
    slug: "handball-project",
    title: "Handball Project",
    description:
      "Projet universitaire : refonte complète du site web d'un club de handball.",
    longContent:
      "HandballProject est un projet universitaire qui consistait à la refonte d'un site web pour un club de handball.\n\nL'occasion d'aborder concrètement Symfony, le rendu Twig, la gestion des entités Doctrine et l'organisation d'un projet en équipe.",
    coverImage: "/projects/handballProject.png",
    techStack: ["Symfony", "PHP", "MySQL", "JavaScript", "HTML", "CSS", "Figma", "Git"],
    category: "école",
    liveUrl: null,
    githubUrl: "https://github.com/achedon12/handball-project",
    featured: false,
  },
  {
    slug: "voyo",
    title: "Voyo",
    description:
      "Projet universitaire : application mobile iOS et Android permettant à quelqu'un qui déménage de mandater une visite immobilière à sa place.",
    longContent:
      "Voyo est un projet universitaire qui consiste en la création d'une application mobile, iOS et Android. Elle permet à une personne souhaitant déménager de mandater une autre personne afin qu'elle visite à sa place un logement.\n\nLe back est en Symfony + MySQL, l'app mobile en React, et tout est conteneurisé via Docker pour faciliter l'environnement de dev partagé en équipe.",
    coverImage: "/projects/voyo.png",
    techStack: ["React", "Symfony", "PHP", "MySQL", "Docker", "JavaScript", "CSS", "Figma", "Git"],
    category: "école",
    liveUrl: null,
    githubUrl: "https://gitlab.com/voyo_project/",
    featured: true,
  },
  {
    slug: "charly-sy-portfolio",
    title: "Charly Sy — Portfolio artiste",
    description:
      "Site portfolio pour un artiste, lui permettant de présenter ses différentes créations. En cours de développement.",
    longContent:
      "Ce site est un site portfolio pour un artiste, lui permettant de présenter ses différentes créations. Le site est actuellement en développement.\n\nFront en Vue.js, back en Symfony pour la gestion du contenu, déploiement en Docker derrière Nginx.",
    coverImage: "/projects/charlySy.jpg",
    techStack: ["Vue.js", "Symfony", "PHP", "MySQL", "Docker", "JavaScript", "CSS", "Figma", "Git"],
    category: "freelance",
    githubUrl: null,
    featured: false,
  },
  {
    slug: "vps",
    title: "VPS — infrastructure perso",
    description:
      "Configuration complète d'un serveur VPS pour héberger l'ensemble des projets perso : Docker (BDD, web, mail), CI/CD via GitLab.",
    longContent:
      "C'est un projet personnel qui m'a particulièrement tenu à cœur, où j'ai pu configurer mon serveur VPS pour héberger mes projets. Il a entièrement été fait avec Docker (BDD, serveur web, serveur de mails, etc.). J'ai également mis en place un système de CI/CD avec GitLab pour permettre des déploiements automatiques.\n\nLe but principal de ce projet n'est pas la simple configuration d'un VPS mais de comprendre comment marche Docker et ainsi pouvoir montrer toute une infrastructure personnelle sur un seul serveur.",
    coverImage: "/projects/vps.png",
    techStack: ["Linux", "Docker", "Git"],
    category: "perso",
    liveUrl: null,
    githubUrl: null,
    featured: true,
  },
  {
    slug: "marketplace-confluent",
    title: "Marketplace Confluent Digital",
    description:
      "Plateforme marketplace multi-modules pour la régie : 4 sites distincts (API + dashboard admin + portail publishers + portail clients) sur un socle commun, auth Keycloak SSO et chiffrement AES-CBC des appels API.",
    longContent:
      "La Marketplace de Confluent Digital est une plateforme à 4 modules qui orchestre la relation publishers / clients de la régie : briefs, campagnes, leads, newsletters, gestion d'organisations, leviers d'acquisition.\n\n**marketplace-api** — Backend en PHP / Phalcon 5 sur MySQL. Migrations Phinx, dump SQL initial pour bootstrapper la base, suite de tests dédiée. Expose une API privée chiffrée (AES-CBC sur le payload) et authentifiée par Keycloak.\n\n**marketplace-admin** — Dashboard interne en Vue 3 (Composition API + `<script setup>`) + Vite 6 + Pinia + Vuestic UI + Tailwind 4. Routing à ~1200 lignes avec ACL granulaire par rôle, deux modes de navigation (topbar / sidebar) au choix de l'utilisateur, charts Chart.js / chartjs-chart-geo, éditeur CKEditor, exports CSV / Excel, génération PDF html2pdf, i18n FR/EN.\n\n**marketplace-publishers** — Portail public pour les éditeurs. Vue 3 + Vite, partage le même socle technique que l'admin avec un périmètre fonctionnel restreint à la gestion des campagnes côté publisher.\n\n**marketplace-clients** — Portail public pour les clients. Vue 3 + Vite, parcours simplifié de soumission de briefs et suivi des campagnes.\n\nL'ensemble tourne sous Docker, avec un network commun, et un déploiement multi-environnements (dev / demo / prod).",
    coverImage: "/projects/marketplace.svg",
    techStack: [
      "Vue 3",
      "Vite",
      "Pinia",
      "Vuestic UI",
      "Tailwind",
      "PHP",
      "Phalcon",
      "MySQL",
      "Keycloak",
      "Docker",
    ],
    category: "pro",
    liveUrl: "https://marketplace-admin.confluent-digital.com",
    githubUrl: null,
    featured: true,
  },
  {
    slug: "edith",
    title: "EDITH — moteur de transcription IA",
    description:
      "Plateforme interne de transcription audio et de traitement IA de la régie : multi-modules (frontend, admin, IA, CLI), bridge OpenAI, exposée en API authentifiée pour les autres apps métier (CallCenterRate, Marketplace).",
    longContent:
      "EDITH est le moteur central de la régie pour tout ce qui touche à la transcription audio et au traitement IA des contenus (appels call-center, briefs vocaux, etc.).\n\nC'est une application PHP 8.3 + Phalcon 5 organisée en 4 modules métier — frontend (consultation), admin (back-office), ia (services IA exposés en API), cli (jobs en ligne de commande via Phalcon Cli\\Console). Persistance MySQL 9.1, migrations Phinx, vues Volt + Tailwind 4.\n\nLa pipeline de requête côté serveur applique systématiquement IP-ban, déchiffrement du payload, logging DB. Le module admin est gardé par Keycloak SSO ; le module IA est gardé par Bearer→ApiKey pour les apps tierces. Service OpenAI dédié pour les transcriptions et les traitements de texte, service d'assemblage pour combiner les sources, service de chiffrement homemade pour aligner avec la marketplace.\n\nDéploiement Docker, suite de tests PHPUnit 10.5 isolée sur une base dédiée.",
    coverImage: "/projects/edith.svg",
    techStack: [
      "PHP",
      "Phalcon",
      "MySQL",
      "Tailwind",
      "Volt",
      "Keycloak",
      "OpenAI",
      "Phinx",
      "Docker",
      "PHPUnit",
    ],
    category: "pro",
    liveUrl: "https://edith.confluent-digital.com",
    githubUrl: null,
    featured: true,
  },
  {
    slug: "callcenterrate",
    title: "CallCenterRate — QA d'appels assistée IA",
    description:
      "App SaaS interne qui transcrit les enregistrements d'appels (via EDITH) et les note automatiquement en confrontant la transcription au script de vente. Tableaux de bord par agent, par campagne, par script.",
    longContent:
      "CallCenterRate transcrit automatiquement les appels d'un centre de relation client (via l'API EDITH) et les confronte au script de vente fourni en PDF pour produire un score de conformité.\n\nCôté technique : Next 16 App Router avec React 19, Prisma 6 sur MySQL, NextAuth (auth Keycloak côté SSO), Tailwind 4. PWA installable via Serwist, internationalisation FR/EN via next-intl. Pipeline asynchrone : ingestion des audios → appel EDITH → scoring → écriture en base → notifications email (Nodemailer).\n\nL'enjeu produit : permettre à 1-2 superviseurs de QA d'audiber l'équivalent de 80 agents call-center, en remontant en quelques clics les appels qui méritent une écoute humaine.\n\nDéploiement Docker multi-stage standalone derrière Nginx, migrations Prisma appliquées au boot via un entrypoint dédié.",
    coverImage: "/projects/callcenterrate.svg",
    techStack: [
      "Next.js",
      "React",
      "Prisma",
      "MySQL",
      "NextAuth",
      "Tailwind",
      "Nodemailer",
      "Serwist",
      "Docker",
    ],
    category: "pro",
    liveUrl: "https://callcenterrate.confluent-digital.com",
    githubUrl: null,
    featured: true,
  },
  {
    slug: "chronos",
    title: "Chronos — automation & reporting",
    description:
      "Outil interne d'automation : tâches planifiées (cron) qui collectent des données via Puppeteer, génèrent des snapshots et des rapports périodiques pour les équipes business.",
    longContent:
      "Chronos est l'outil de scheduler / scraping / reporting interne. Il pilote un ensemble de jobs récurrents (snapshots de pages, agrégation de KPIs, génération de rapports) et expose un dashboard pour suivre leur exécution.\n\nStack : Next.js + React, jobs planifiés via node-cron, scraping headless via Puppeteer, génération d'images via Sharp, auth Keycloak SSO comme le reste des apps internes. Toasts UI via react-toastify, icônes lucide-react, tokens JWT décodés via jwt-decode pour la session.\n\nDéploiement Docker derrière Nginx.",
    coverImage: "/projects/chronos.svg",
    techStack: [
      "Next.js",
      "React",
      "Puppeteer",
      "node-cron",
      "Sharp",
      "Keycloak",
      "Docker",
    ],
    category: "pro",
    liveUrl: "https://chronos.confluent-digital.com",
    githubUrl: null,
    featured: false,
  },
];

async function seedProjects() {

  for (const p of PROJECTS) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      create: p,
      update: p,
    });
  }
  console.log(`[seed] projects upserted: ${PROJECTS.length}`);
}

/**
 * Import ponctuel des 3 fichiers MDX historiques de content/blog/ vers la DB.
 * Strictement idempotent : si un slug existe déjà en DB, on ne touche pas
 * (l'admin a peut-être édité l'article via l'UI, on ne veut pas écraser).
 */
async function seedBlogPostsFromMdx() {
  const dir = path.join(process.cwd(), "content", "blog");
  let files = [];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".mdx"));
  } catch {
    return;
  }

  let imported = 0;
  let skipped = 0;
  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      skipped++;
      continue;
    }
    const raw = await fs.readFile(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const publishedAt = data.publishedAt ? new Date(data.publishedAt) : new Date();
    await prisma.blogPost.create({
      data: {
        slug,
        title: data.title ?? slug,
        description: data.description ?? "",
        content,
        tags: Array.isArray(data.tags) ? data.tags : [],
        published: true,
        publishedAt,
      },
    });
    imported++;
  }
  if (imported > 0 || skipped > 0) {
    console.log(`[seed] blog posts: ${imported} imported, ${skipped} skipped (already in DB)`);
  }
}

async function main() {
  await seedAdmin();
  await seedProjects();
  await seedBlogPostsFromMdx();
}

main()
  .catch((e) => {
    console.error("[seed] failure:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
