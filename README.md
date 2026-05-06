# leoderoin-portfolio

Portfolio immersif de Léo Deroin — voyage spatial à travers projets et compétences.

**Stack** : Next.js 16 · React 19 · TypeScript strict · Tailwind 4 · shadcn/ui · Prisma 6 · MySQL 9 · Three.js + R3F + drei · GSAP + ScrollTrigger · Framer Motion · Lenis · next-intl · NextAuth v4 · Resend (+ Nodemailer fallback) · Zod · React Hook Form · MDX (next-mdx-remote + shiki)

---

## Pré-requis

- Node 22+
- Docker + Docker Compose v2
- npm 10+

## Installation

```bash
# 1. Copier l'env
cp .env.example .env
#    → ajuster ADMIN_EMAIL, ADMIN_PASSWORD, NEXTAUTH_SECRET (openssl rand -base64 32)

# 2. Installer les deps
npm install

# 3. Démarrer la DB de dev (+ Mailhog pour tester les emails)
npm run docker:dev:up
#    DB         exposée sur localhost:3308 (modifiable via DOCKER_DB_PORT)
#    Mailhog UI sur http://localhost:8025 / SMTP sur localhost:1025

# 4. Au premier run uniquement (ou après pull) : appliquer les migrations + seed admin
npm run db:migrate         # = prisma migrate dev (génère + applique + regénère le client)
npm run db:seed            # crée l'admin (idempotent)

# 5. Lancer le dev server
npm run dev
#    → http://localhost:3000
```

> **Note grant DB** : MySQL 9 + Prisma migrate dev a besoin de droits `CREATE DATABASE` pour la *shadow DB*.
> Au premier setup, accorder les droits au user portfolio :
> ```bash
> docker exec portfolio_db mysql -uroot -p$MYSQL_ROOT_PASSWORD \
>   -e "GRANT ALL PRIVILEGES ON *.* TO 'portfolio'@'%' WITH GRANT OPTION; FLUSH PRIVILEGES;"
> ```

## Scripts

| Commande | Effet |
| --- | --- |
| `npm run dev` | Next dev server (port 3000) |
| `npm run build` | `prisma generate` + build prod |
| `npm run start` | Serveur prod (après build) |
| `npm run lint` | ESLint |
| `npm run db:migrate` | `prisma migrate dev` (dev — crée la migration + applique) |
| `npm run db:deploy` | `prisma migrate deploy` (prod — applique seulement) |
| `npm run db:status` | État des migrations |
| `npm run db:studio` | Prisma Studio |
| `npm run db:seed` | Bootstrap admin (idempotent) |
| `npm run db:generate` | Regénère le Prisma Client |
| `npm run docker:dev:up` | Démarre `db` + `mailhog` |
| `npm run docker:dev:down` | Arrête le stack dev |
| `npm run docker:prod:up` | Build + démarre `db` + `app` + `nginx` |
| `npm run docker:prod:down` | Arrête le stack prod |

## Workflow Prisma

**Toute évolution du modèle passe par une migration commitée.**

```bash
# 1. Modifier prisma/schema.prisma
# 2. Générer + appliquer en dev
npm run db:migrate -- --name nom_de_la_migration
# 3. Commit le dossier prisma/migrations/<timestamp>_nom_de_la_migration/
```

En prod, l'`entrypoint.sh` du conteneur app exécute automatiquement
`prisma migrate deploy` puis `prisma db seed` au démarrage.
Skip via `SKIP_DB_MIGRATE=1` ou `SKIP_DB_SEED=1`.

## Déploiement (Docker compose prod)

```bash
# 1. Copier .env.example → .env et remplir TOUTES les variables (RESEND_API_KEY, NEXTAUTH_SECRET fort, etc.)
cp .env.example .env

# 2. Build + up
npm run docker:prod:up
#    portfolio_db    : MySQL persisté dans ./db
#    portfolio_app   : Next standalone, applique migrations + seed au boot
#    portfolio_nginx : reverse proxy sur DOCKER_HTTP_PORT (default 80)
```

Pour exposer en HTTPS, brancher un reverse proxy externe (Traefik, Caddy)
ou ajuster `.docker/nginx/default.conf` + monter les certificats.

## Arborescence

```
src/
  app/                     # App Router
    (public)/              # Pages publiques (à venir)
    (admin)/               # Pages admin (à venir)
    api/                   # Route handlers (à venir)
    layout.tsx             # Root layout (fonts, metadata, body)
    page.tsx               # Landing temporaire — phase 1
    globals.css            # Tailwind 4 @theme + reset reduced-motion
  components/
    three/                 # Scènes Three.js / R3F
    sections/              # Sections (Hero, About, Skills, Timeline…)
    ui/                    # shadcn/ui
  i18n/request.ts          # Config next-intl
  messages/{fr,en}.json    # Traductions
  lib/                     # prisma client, utils, validations, auth, etc.
  hooks/
prisma/
  schema.prisma
  migrations/              # ⚠ committed
  seed.mjs
public/
  textures/                # Textures 3D
  sounds/                  # Sons d'ambiance
.docker/
  app/entrypoint.sh        # Migrate deploy + seed au boot
  nginx/default.conf
docker-compose.yml         # prod : db + app + nginx
docker-compose.dev.yml     # dev  : db + mailhog
Dockerfile                 # Multi-stage (deps → builder → runner standalone)
```

## État actuel — toutes phases livrées

✅ **Init** Next 16 + TS strict + Tailwind 4 + structure src/, public/, prisma/, .docker/
✅ **Docker** compose dev + prod, Dockerfile multi-stage standalone, entrypoint migrate+seed, nginx
✅ **Prisma** 5 modèles + migration initiale + seed (admin idempotent + 5 projets exemples)
✅ **Layout** Lenis smooth scroll + sound provider (toggle, fichiers audio à ajouter dans `/public/sounds/`)
✅ **Header / Footer** custom — nav, lien socials, sound toggle
✅ **Starfield 3D** background global, 3 couches parallaxe + shader scintillement, fallback CSS pour `prefers-reduced-motion`
✅ **Hero 3D** planète procédurale (shader fbm + atmosphère fresnel), satellites tech en orbite, fallback CSS
✅ **About** carte HUD, stats animées au scroll
✅ **Skills constellation** SVG interactif, hover, filtres par catégorie
✅ **Timeline** trajectoire avec fusée scroll-pinned (GSAP ScrollTrigger lazy-loadé)
✅ **Contact terminal** form Zod + RHF + honeypot + rate-limit DB + Resend/Nodemailer
✅ **Pages projets** liste avec filtres techno/catégorie + détail avec prev/next + JSON-LD
✅ **Admin** NextAuth credentials + middleware (proxy.ts en Next 16) + dashboard + CRUD projets + gestion messages
✅ **Blog MDX** liste paginée + article avec frontmatter, reading time, TOC sticky avec scrollspy, syntax highlight shiki (`github-dark-default`), partage X/LinkedIn/copy-link, prev/next, JSON-LD BlogPosting
✅ **SEO** metadata par page, sitemap.xml dynamique, robots.txt, JSON-LD Person/WebSite/CreativeWork
✅ **Analytics** custom (PageView en MySQL, IP hashée + sel quotidien) + Vercel Analytics
✅ **i18n** next-intl FR (EN dispo dans messages/, switcher UI à brancher en v2)
✅ **A11y** clavier, focus visibles, ARIA, contraste, `prefers-reduced-motion` respecté
✅ **Lint clean** + `next build` ✅ + smoke test routes + auth gating + DB persistance vérifiés

🟡 À ajouter par toi (data perso) :
- Photo dans `/public/` + remplacer le placeholder `LD` dans About.tsx
- Réécrire `src/lib/profile.ts`, `src/lib/timeline.ts` (dates, employeurs réels) avec ton vrai parcours
- Vérifier les 5 projets seed dans `prisma/seed.mjs` (textes plausibles, à relire/adapter)
- Optionnel : sons ambiants dans `/public/sounds/{warp,hover,click}.mp3` (le toggle est OFF par défaut)
- Articles du blog dans `content/blog/*.mdx` — j'en ai écrit 3 plausibles, à relire / adapter / compléter
