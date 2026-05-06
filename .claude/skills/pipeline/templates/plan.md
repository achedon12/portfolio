# Plan d'action — `<titre court de la tâche>`

## Type
`fix` | `feature` | `refactor` | `chore` | `perf` | `docs`

## Contexte
<2-3 phrases : pourquoi cette tâche, quel besoin elle adresse, comment elle s'inscrit dans le projet>

## Reproduction (uniquement pour `fix`)

### Étapes
1. <commande curl complète OU parcours UI précis (FR + EN si applicable)>
2. <ou requête SQL pour mettre la DB dans un état précis>
3. <observation>

### Comportement observé vs attendu
- **Observé** : `HTTP <code>` — `<body>` (ou écran/console)
- **Attendu** : `HTTP <code>` — `<body>` (ou écran/console)

### Cause racine
- **Localisation** : `<fichier>:<ligne>`
- **Explication** : <1-2 phrases>

## Cartographie (pour `feature` / `refactor`)

### Surface touchée
- [ ] Pages publiques (`src/app/[locale]/(public)/...`)
- [ ] Pages admin (`src/app/(admin)/admin/...`)
- [ ] Routes API publiques (`src/app/api/...` hors `admin/`)
- [ ] Routes API admin (`src/app/api/admin/...`)
- [ ] Helpers lib (`src/lib/...`)
- [ ] Composants client (`src/components/...`)
- [ ] Schéma Prisma (`prisma/schema.prisma`) + migration
- [ ] Traductions (`src/messages/{fr,en}.json`)
- [ ] Sitemap (`src/app/sitemap.ts`)
- [ ] JSON-LD / metadata (`src/lib/seo.ts`, `generateMetadata`)
- [ ] Auth (`src/lib/auth.ts`, `src/proxy.ts`)
- [ ] Config (`next.config.ts`, `tsconfig.json`, `package.json`, `eslint.config.mjs`)
- [ ] Content MDX (`content/blog/...`)

### Fichiers à toucher

| Action | Chemin | Rôle |
|---|---|---|
| Créer | `src/...` | <pourquoi> |
| Modifier | `src/...` | <quoi changer> |
| Supprimer | `src/...` | <pourquoi> |

### Schéma Prisma
- [ ] Aucune modif
- [ ] Nouveau modèle : `<Model>`
- [ ] Modification d'un modèle existant : `<Model>` (ajout colonne / index / relation)
- [ ] Migration : `npm run db:migrate -- --name <name>` OU hand-write SQL si drop/rename avec données. Référence : skill `prisma-migration`.

### Routes ajoutées / modifiées

| Méthode | URL | Handler | Auth | Rate-limit |
|---|---|---|---|---|
| POST | `/api/...` | `route.ts::POST` | publique / admin | clé + fenêtre |
| PATCH | `/api/admin/...` | `route.ts::PATCH` | `getAdminSession` | — |

### Composants ajoutés / modifiés

| Composant | Type | Fichier | Locale-aware ? |
|---|---|---|---|
| `<Name>` | `"use client"` ou server | `src/components/...` | OUI / NON |

### Traductions ajoutées

| Clé | FR | EN |
|---|---|---|
| `<Namespace>.<key>` | `<fr>` | `<en>` |

### SEO impacté

- [ ] Aucune modif SEO
- [ ] Nouveau `generateMetadata` (avec `alternates.languages` FR/EN/x-default)
- [ ] Nouveau JSON-LD (préciser le type : `BlogPosting`, `CreativeWork`, `BreadcrumbList`...)
- [ ] Nouvelle entrée sitemap (`src/app/sitemap.ts`, double FR/EN)
- [ ] Cache ISR : `revalidatePath()` à appeler après mutation admin

### Persistance attendue

- `<Model>` : <colonnes remplies sur succès, contraintes uniques respectées>
- `BlogPostLike` / `BlogComment` / `RateLimit` impactés ? (si oui détailler)

## Risques de régression

- <feature existante 1> qui dépend de `<fichier>:<ligne>` modifié.
- <feature existante 2> qui consomme `<fonction>` refactorisée.
- Multi-root layouts intacts (pas de réintroduction d'`app/layout.tsx`).
- Navigation localisée préservée (pas de retour à `next/link` côté public).
- Parité i18n FR/EN.

## Tests destructifs prévus

(détaillés dans `tests-report.md` à l'étape 3)

- [ ] Auth : route admin sans cookie / session expirée / `/admin/login` accessible
- [ ] Validation : champs Zod manquants / types invalides / payload géant / honeypot rempli
- [ ] Sécurité : XSS / SQL injection (`$queryRaw`) / secrets dans logs / IP brute en DB / pepper en dur
- [ ] Concurrence : double like / F5 view (rate-limit 24h) / spam contact / spam comment
- [ ] Edge cases : article non publié / commentaires désactivés / locale switch FR↔EN / 404 / sitemap / RSS
- [ ] Persistance : `BlogPost.viewCount` / `BlogPostLike` unique / `BlogComment.status` transitions / cascade delete

## Rollback

Si la modif casse en prod :

1. `git revert <sha>` + redéploiement.
2. Si modif Prisma : la migration reste appliquée — créer une migration "revert" qui annule le changement.

(Les migrations versionnées sont commitées : pas de revert magique côté DB.)
