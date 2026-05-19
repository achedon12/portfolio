# leoderoin-portfolio

Portfolio immersif de Léo Deroin — voyage spatial à travers projets, parcours et carnets de bord. Bilingue FR/EN.

**Stack** : Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind 4 · shadcn/ui · Prisma 6 · MySQL 9 · Three.js + R3F + drei · GSAP + ScrollTrigger · Framer Motion · Lenis · next-intl · next-themes · NextAuth v4 · Resend (+ Nodemailer fallback) · Zod · React Hook Form · MDX (next-mdx-remote + shiki).

---

## Pré-requis

- Node 22+
- Docker + Docker Compose v2
- npm 10+

## Installation (dev)

```bash
# 1. Copier l'env
cp .env.example .env
#    → ajuster ADMIN_EMAIL, ADMIN_PASSWORD, NEXTAUTH_SECRET (openssl rand -base64 32),
#      IP_HASH_PEPPER (openssl rand -base64 32), et les vars Matomo / SEO si besoin

# 2. Installer les deps
npm install

# 3. Démarrer la DB de dev (+ Mailhog pour tester les emails)
npm run docker:dev:up
#    DB         → localhost:3308 (modifiable via DOCKER_DB_PORT)
#    Mailhog UI → http://localhost:8025  (SMTP sur localhost:1025)

# 4. Premier run uniquement (ou après pull) : migrations + seed
npm run db:migrate         # = prisma migrate dev
npm run db:seed            # bootstrap admin + projets + import MDX → DB

# 5. Lancer le dev server
npm run dev
#    → http://localhost:3000 (ou 3001 si 3000 est pris)
```

> **Note grant DB** : MySQL 9 + `prisma migrate dev` exige des privilèges étendus pour la *shadow DB*. À faire une fois au premier setup :
> ```bash
> docker exec portfolio_db mysql -uroot -p$MYSQL_ROOT_PASSWORD \
>   -e "GRANT ALL PRIVILEGES ON *.* TO 'portfolio'@'%' WITH GRANT OPTION; FLUSH PRIVILEGES;"
> ```

> **`npm run lint` est cassé** sur Next 16 (`Invalid project directory provided, no such directory: …/lint`). Utiliser `npx eslint src` directement.

## Scripts

| Commande                   | Effet                                                            |
|----------------------------|------------------------------------------------------------------|
| `npm run dev`              | Next dev server (Turbopack, port 3000)                           |
| `npm run build`            | `prisma generate` + build prod (output standalone)               |
| `npm run start`            | Serveur prod (après build)                                       |
| `npm run db:migrate`       | `prisma migrate dev` — crée la migration + applique + regen      |
| `npm run db:deploy`        | `prisma migrate deploy` — applique seulement (prod)              |
| `npm run db:status`        | État des migrations                                              |
| `npm run db:studio`        | Prisma Studio                                                    |
| `npm run db:seed`          | Bootstrap admin + projets + import MDX (idempotent)              |
| `npm run db:generate`      | Regénère le Prisma Client                                        |
| `npm run docker:dev:up`    | Démarre `db` + `mailhog`                                         |
| `npm run docker:dev:down`  | Arrête le stack dev                                              |
| `npm run docker:prod:up`   | Build + démarre `db` + `app` + `nginx`                           |
| `npm run docker:prod:down` | Arrête le stack prod                                             |

## Workflow Prisma

**Toute évolution du modèle passe par une migration commitée.**

```bash
# 1. Modifier prisma/schema.prisma
# 2. Générer + appliquer en dev
npm run db:migrate -- --name nom_de_la_migration
# 3. Commit le dossier prisma/migrations/<timestamp>_nom_de_la_migration/
```

Pour les drops/renames sur des colonnes avec données, `migrate dev` exige une confirmation interactive — préférer un fichier SQL hand-write puis `npx prisma migrate deploy`. Voir `.claude/skills/prisma-migration/SKILL.md`.

En prod, l'`entrypoint.sh` du conteneur app exécute automatiquement `prisma migrate deploy` puis `prisma db seed` au démarrage. Skip via `SKIP_DB_MIGRATE=1` ou `SKIP_DB_SEED=1`.

## Déploiement (Docker compose prod)

```bash
# 1. Remplir .env avec les vraies valeurs
#    NEXTAUTH_URL=https://www.leoderoin.fr
#    NEXT_PUBLIC_APP_URL=https://www.leoderoin.fr
#    NEXTAUTH_SECRET=<openssl rand -base64 32>
#    IP_HASH_PEPPER=<openssl rand -base64 32>  (constant, jamais le changer en prod)
#    SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM (envoi des mails de contact)
#    MATOMO_API_TOKEN=<...>  (si tu utilises le dashboard admin Matomo)
#    DOCKER_HTTP_PORT=80 (ou autre)

# 2. Build + up
npm run docker:prod:up
#    portfolio_db    : MySQL persisté dans ./db
#    portfolio_app   : Next standalone, applique migrations + seed au boot, healthcheck wget
#    portfolio_nginx : reverse proxy sur DOCKER_HTTP_PORT (default 80)
```

Pour exposer en HTTPS, brancher un reverse proxy externe (Traefik, Caddy) ou ajuster `.docker/nginx/default.conf` + monter les certificats.

> Le Dockerfile passe les `NEXT_PUBLIC_*` (Matomo URL/site, vérifications Google/Bing, App URL) en `ARG` au stage `builder` parce que Next inline ces vars au moment du build — il FAUT qu'elles soient présentes avant `npm run build`. Sinon les bundles JS sortent avec des chaînes vides.

## Routes principales

### Public (FR par défaut, EN sous `/en`)

| Route | Rôle |
|---|---|
| `/` | Landing : Hero 3D, About, Skills, Timeline, Contact |
| `/projects` | Galerie filtrable (catégorie + stack) |
| `/projects/[slug]` | Détail projet (storytelling, captures, prev/next, JSON-LD CreativeWork) |
| `/blog` | Liste articles paginée + flux RSS |
| `/blog/[slug]` | Article avec TOC sticky, syntax highlight shiki, partage, **vues / likes / commentaires** |
| `/uses` | Mon setup et ma stack (`/uses` style) |
| `/sitemap.xml`, `/blog/rss.xml`, `/robots.txt` | SEO |

### Admin (FR-only, gated NextAuth)

| Route | Rôle |
|---|---|
| `/admin/login` | Form NextAuth credentials |
| `/admin` | Dashboard (vue d'ensemble) |
| `/admin/messages` | Inbox des messages contact |
| `/admin/projects` | CRUD projets |
| `/admin/blog` | CRUD articles + toggle commentaires + reset stats |
| `/admin/blog/comments` | Modération (file pending/approved/spam) |
| `/admin/analytics` | Dashboard Matomo (sparkline, top pages, top referrers) |

## Arborescence

```
src/
  app/
    [locale]/                  # Public, bilingue
      layout.tsx               # Root layout : <html lang>, NextIntlClientProvider, ThemeProvider
      not-found.tsx            # 404 stylisée locale-aware
      (public)/                # Group : SmoothScroll + Header + Starfield + Footer
        layout.tsx
        page.tsx               # Home
        projects/, blog/, uses/, …
    (admin)/                   # Admin FR-only, root layout séparé
      layout.tsx               # <html lang="fr">, sidebar, NextAuth gate
      not-found.tsx
      admin/                   # /admin/*
    api/                       # Routes API (publiques + admin/*)
    sitemap.ts, robots.ts, manifest.ts, icon.tsx, opengraph-image.tsx, …
    blog/rss.xml/route.ts      # RSS (non localisé)
    globals.css                # @theme + overrides .light
  components/
    three/                     # Scènes Three.js / R3F (Hero planet, Starfield)
    sections/                  # Sections home (Hero, About, Skills, Timeline, Contact)
    blog/                      # PostCard, TOC, Share, ViewTracker, LikeButton, CommentForm, CommentsSection
    projects/                  # ProjectCard, ProjectFilters
    admin/                     # SignOut, Sparkline, BlogPostForm, ProjectForm
    providers/                 # ThemeProvider, SmoothScroll
    Header.tsx, Footer.tsx, LocaleSwitcher.tsx, ThemeToggle.tsx, Matomo.tsx
  i18n/
    routing.ts, navigation.ts, request.ts
  messages/{fr,en}.json        # Dictionnaires complets
  lib/                         # prisma, auth, blog, profile, seo, validations, ip-hash, rate-limit, matomo, …
  proxy.ts                     # Middleware Next 16 : NextAuth admin + next-intl public
prisma/
  schema.prisma                # 6 modèles : ContactMessage, Project, RateLimit, AdminUser, BlogPost, BlogPostLike, BlogComment
  migrations/                  # ⚠ commitées
  seed.mjs                     # admin + 10 projets + import MDX content/blog → DB
content/
  blog/*.mdx                   # Articles long-form (importés au seed)
public/
  profile.jpg, projects/, ...
.docker/
  app/entrypoint.sh            # migrate deploy + seed au boot
  nginx/default.conf
.claude/                       # Configuration Claude Code (rules, skills, agents) — voir .claude/README.md
docker-compose.yml             # prod : db + app + nginx
docker-compose.dev.yml         # dev  : db + mailhog
Dockerfile                     # Multi-stage standalone
```

## Features

- **Bilingue FR/EN** via next-intl, `localePrefix: as-needed` (FR à `/`, EN à `/en`)
- **Multi-root layouts** : `[locale]/layout.tsx` (public) et `(admin)/layout.tsx` (admin) — chacun avec son propre `<html>`, pas de `app/layout.tsx`
- **Thème dark/light** : dark par défaut, light "doux" off-white teinté violet, toggle dans le header
- **3D / animations** : planète procédurale shader (fbm + fresnel), starfield 3 couches parallaxe, fusée scroll-pinned via GSAP ScrollTrigger lazy-loadé, Framer Motion pour les transitions, Lenis smooth scroll, fallback `prefers-reduced-motion`
- **Engagement blog anonyme** :
  - **vues** rate-limited 1/IP/post/24h (table `RateLimit`)
  - **likes** toggle (table `BlogPostLike`, unique sur `(postId, ipHash)`)
  - **commentaires** modérés (table `BlogComment`, statuts `pending / approved / spam`)
  - **IP hashée** SHA-256 + pepper (`IP_HASH_PEPPER`), jamais l'IP brute (RGPD)
- **SEO** : metadata + JSON-LD par page (`Person`, `WebSite`, `ProfessionalService`, `BlogPosting`, `CreativeWork`, `BreadcrumbList`, `CollectionPage`, `ItemList`), sitemap.xml dual-locale avec hreflang, RSS, OpenGraph image générée via `ImageResponse`, favicons / manifest / Apple icon programmatiques, mots-clés ciblés Lyon
- **Admin** : NextAuth credentials + JWT, CRUD projets, CRUD articles avec section SEO complète + toggle commentaires + reset stats, modération commentaires avec onglets pending/approved/spam, dashboard Matomo (sparkline interactive)
- **Email** : Resend en prod (Nodemailer fallback), notification owner sur nouveau message contact
- **A11y** : clavier, focus visibles, ARIA, contraste, `prefers-reduced-motion` respecté

## Configuration Claude Code

Le dossier `.claude/` contient :
- `rules/` : 8 fichiers d'architecture chargés automatiquement (auto-discovery, certains scopés via `paths:` frontmatter)
- `skills/` : 5 skills déclenchables (`pipeline`, `i18n-string`, `prisma-migration`, `next-api-route`, `blog-post`)
- `agents/` : reviewer `nextjs-code-reviewer`
- `settings.json` : pré-autorisation des commandes courantes, deny-list des destructives

Voir `.claude/README.md` pour le détail. Le `CLAUDE.md` à la racine sert d'index pour les sessions Claude Code.
