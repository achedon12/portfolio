---
name: pipeline
description: Pipeline complet de développement intransigeant déclenché par `/pipeline <description de tâche>` (ex. `/pipeline ajoute un endpoint GET /api/blog/[slug]/comments/count qui retourne le nombre de commentaires approuvés`, `/pipeline fix le LikeButton qui crash quand l'API like est down`, `/pipeline refactor uses.ts pour charger la config depuis un MDX au lieu de TS`). Enchaîne analyse → implémentation → tests destructifs → PR GitHub → review automatique → boucle de correction. Aucune sortie sans `tsc --noEmit` propre, smoke tests verts et review VALIDÉ. Usage exclusif quand l'utilisateur invoque `/pipeline`.
---

# `/pipeline` — Pipeline de développement intransigeant

Ce skill prend en entrée la description libre d'une tâche (passée comme argument à `/pipeline`) et exécute un cycle complet de livraison sans compromis. Il ne se termine que quand le code est mergeable et qu'une review automatique a rendu un verdict **VALIDÉ**.

## Règles transversales (s'appliquent à toutes les étapes)

- **Français** partout : commentaires de code, docstrings, messages de commit, titre et description de PR, rapports.
- **Conventional commits FR** : `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`, `perf:`, `style:`. Sujet à l'impératif présent (`feat: ajoute la route GET /api/blog/[slug]/comments/count`).
- **TypeScript strict** : tout fichier nouveau doit compiler sous `strict: true`. Pas de `any` ni `as any` non justifiés. `as unknown as T` toléré uniquement aux frontières (DB JSON, FormData).
- **Annonce avant action** : avant chaque tool call non-trivial, dis en une phrase ce que tu vas faire et pourquoi.
- **Aucune validation sans preuve** : un test passe seulement si tu l'as exécuté et observé le résultat. Pas de "ça devrait marcher".
- **Pas de raccourcis destructeurs** : jamais `--no-verify`, `--force`, `prisma migrate reset`, `db push --force-reset`, `git reset --hard`, `docker compose down -v`, désactivation de hooks. Voir les `deny` de `.claude/settings.json`.
- **Si blocage technique réel** : poser une question précise à l'utilisateur. Ne **JAMAIS** inventer une route, un model Prisma inexistant, une variable d'env, une clé i18n. Le projet est petit — tout doit pouvoir se vérifier par `Grep` ou `Read`.
- **Contexte projet à charger** :
  - Stack : Next.js 16 App Router + React 19 + TypeScript strict, Prisma 6, MySQL 9, Tailwind v4, NextAuth (admin uniquement, JWT), next-intl (FR/EN, `localePrefix: as-needed`), Three.js + R3F + GSAP + Framer Motion + Lenis, Resend (+ Nodemailer fallback).
  - URL locale : `http://localhost:3000`.
  - DB dev : container `portfolio_db` exposé sur port `3308`. User `portfolio`, schéma `portfolio`.
  - Lint/check : **`npx tsc --noEmit`** + **`npx eslint src`** (`npm run lint` est cassé sur Next 16). Pas de runner de tests configuré.
  - Build : **`npm run build`** (= `prisma generate && next build`).
  - Voir `CLAUDE.md` à la racine et `.claude/rules/*.md` pour l'archi détaillée et les invariants — multi-root layouts, `proxy.ts`, navigation localisée, engagement IP-hashed, etc.
- **Skills métier à composer avec celui-ci** quand pertinent : `prisma-migration`, `i18n-string`, `next-api-route`, `blog-post`. Si la tâche colle à un de ces skills, suis sa procédure dans l'étape 2 plutôt que de tout réinventer.

## Étape 0 — Préparation (avant l'étape 1)

Avant de toucher au code :

1. Identifier le **type** de tâche : `fix` | `feature` | `refactor` | `chore` | `perf` | `docs`.
2. `git status` + `git branch --show-current`. Si la branche actuelle est `main` ou une branche de PR ouverte, créer une nouvelle branche : `git checkout -b <type>/<slug-court-en-snake-case>`.
3. Vérifier que la stack dev tourne :
   ```bash
   docker compose -f docker-compose.dev.yml ps
   curl -sI http://localhost:3000/ 2>/dev/null || echo "next dev pas démarré"
   ```
   Si la DB ne tourne pas : `docker compose -f docker-compose.dev.yml up -d` (attendre que `portfolio_db` soit `healthy`). Si Next n'est pas lancé : demander à l'utilisateur de lancer `npm run dev` (interactif, ne pas le démarrer en background depuis le skill). Si `.next/` est root-owned (héritage Docker), demander un `sudo rm -rf .next` à l'utilisateur — ne pas tenter sudo soi-même.
4. Annoncer à l'utilisateur le **type identifié** et le **plan macro** (les étapes que tu vas suivre). Une seule phrase par étape.

## Étape 1 — Analyse & reproduction

**Livrable obligatoire** : un plan d'action écrit, validé contre la réalité du code, **avant la première modification**. Utilise `templates/plan.md`.

### Pour un `fix` / `bug`

1. Reproduire le bug **avant toute correction**. Outils :
   - `curl -X <METHOD> http://localhost:3000/<route>` avec headers/body adéquats. Pour les routes admin, créer ou réutiliser le compte admin (créé par le seed, credentials dans `.env` `ADMIN_EMAIL` / `ADMIN_PASSWORD`). Connexion via `/admin/login`.
   - Logs : la sortie de `npm run dev` (terminal de l'utilisateur). Si Prisma loggue, c'est dans la même sortie.
   - DB read-only :
     ```bash
     docker exec portfolio_db mysql -uportfolio -pchangeme portfolio -e "SELECT ... FROM ..."
     ```
   - Tester en FR (`/foo`) ET en EN (`/en/foo`) si la modif touche le rendu locale-aware.
2. Si la repro nécessite un état (post `pending`, projet seedé, comment `approved`) :
   - Re-seed : `npm run db:seed` (idempotent).
   - Insertion ciblée via `mysql` ou via l'admin form.
3. Documenter dans le plan :
   - Étapes exactes pour reproduire (commande curl complète, ou parcours UI).
   - Comportement observé vs attendu (status code + body, ou état UI).
   - Hypothèse de cause racine localisée à `fichier:ligne` (Grep + Read).
4. **Interdit** d'écrire la moindre ligne de fix tant que le bug n'est pas reproduit ET que la cause racine n'est pas identifiée à un emplacement précis.

### Pour une `feature`

1. Cartographier les **points d'intégration** : pages `[locale]/(public)`, pages `(admin)`, routes API publiques vs admin, modèles Prisma, helpers `src/lib/`, composants React, traductions `src/messages/{fr,en}.json`, sitemap.
2. Identifier les **dépendances inverses** : `Grep` les imports/usages des fichiers à toucher.
3. Lister les **risques** spécifiques au projet :
   - Multi-root layouts : ne JAMAIS réintroduire un `app/layout.tsx`. Le `<html>` vit dans `[locale]/layout.tsx` et `(admin)/layout.tsx`.
   - Navigation localisée : tout composant rendu sous `[locale]/(public)/**` doit importer `Link`/`useRouter` depuis `@/i18n/navigation`, jamais `next/link`/`next/navigation`.
   - `setRequestLocale(locale)` obligatoire au début de chaque page sous `[locale]/`. Sinon SSG cassée.
   - Parité i18n : toute clé ajoutée dans `fr.json` doit être dans `en.json`, en une passe.
   - IP brute jamais persistée : engagement (likes / views / commentaires) hash via `hashIp(getClientIp(req))` (`src/lib/ip-hash.ts`). Stocker `ipHash`, jamais `ip`.
   - Schéma Prisma : migrations versionnées commitées sous `prisma/migrations/`. Jamais `db push`. `migrate dev` interactif sur drop/rename — workflow hand-write SQL si besoin.
   - SEO : nouvelle URL publique = ajouter au sitemap (FR + EN avec hreflang) + JSON-LD si page de premier rang.
   - Cache ISR (`revalidate = 60`) : toute mutation admin sur Project/BlogPost doit `revalidatePath()` les routes publiques impactées.
4. Si la feature touche client + serveur + DB, planifier l'ordre : **schéma Prisma → `migrate dev` → route API → helper lib → composant React → traductions FR + EN → page → sitemap**.

### Pour un `refactor`

1. Cartographier le code existant et **tous** ses consommateurs (`Grep` sur les exports publics touchés).
2. Définir l'invariant à préserver : signature de fonction/composant exportée, format de réponse JSON d'API, schéma DB, contrats i18n.
3. Planifier en étapes atomiques, chacune devant laisser le projet **bootable** (`npx tsc --noEmit` + `npx eslint src` OK + page principale qui répond toujours).

### Validation de l'étape 1

Le plan doit explicitement répondre à :

- Quels **fichiers** créés / modifiés / supprimés (chemins absolus).
- Quels **smoke tests** (curl + parcours UI FR + EN) seront pertinents (étape 3).
- Quelle **vérif DB** est nécessaire (lignes attendues dans `BlogPost`, `BlogComment`, `BlogPostLike`, `ContactMessage`...).
- Quel **risque de régression** et sur quel autre endpoint / page.
- Quel **rollback** si ça casse.

Une fois le plan écrit, l'afficher à l'utilisateur. Pas de "j'ai un plan en tête" — montrer.

## Étape 2 — Implémentation

### Règles strictes

- **Conventions du projet** :
  - TypeScript strict en tête. Pas de bypass `// @ts-ignore` non justifié.
  - Imports `@/*` pour tout sous `src/`.
  - Routes API publiques mutating : `runtime = "nodejs"`, validation Zod (codes d'erreur, pas de strings traduites), rate-limit obligatoire, IP toujours hashée. Référence : skill `next-api-route`.
  - Routes API admin : `runtime = "nodejs"`, `getAdminSession()` ou 401, `revalidatePath()` après mutation. Référence : skill `next-api-route`.
  - Pages publiques sous `[locale]/(public)/**` : `await params`, `setRequestLocale(locale)`, `getTranslations()`, `Link` depuis `@/i18n/navigation`.
  - Pages admin sous `(admin)/admin/**` : `getAdminSession()` (côté layout ou page), pas de `t(...)` requis (FR-only).
  - Composants client publics : `"use client"`, `useTranslations()`, `useLocale()` quand applicable, `Link` depuis `@/i18n/navigation`.
  - Mutations client → serveur : appeler `revalidatePath()` côté API admin pour rafraîchir l'ISR.
  - Modèles Prisma : `Int @id @default(autoincrement())`, `@@index` sur les colonnes filtrées, `onDelete: Cascade` pour les relations engagement.
- **Auth** :
  - Routes admin (`src/app/api/admin/**`) : `getAdminSession()` puis 401 si null.
  - Pages admin (`src/app/(admin)/admin/**`) : couvert par `proxy.ts` (NextAuth gate). Le layout peut ré-checker via `getAdminSession()` pour adapter l'UI.
  - Pas de session côté public — anonymat complet, dédup par `ipHash`.
- **Engagement** : si la tâche le touche, l'IP brute ne doit JAMAIS être persistée. Toujours `hashIp(getClientIp(req))`. Une mutation = transaction Prisma quand multi-table (toggle like = insert + counter increment).
- **i18n** : aucune string UI hardcodée côté public. Pour ajouter une clé, suivre le skill `i18n-string` — éditer les 2 fichiers `fr.json` + `en.json` en une fois.
- **Commentaires français** sur les fonctions exportées non triviales. JSDoc minimal (`@param`, `@returns`).
- **Code auto-documenté** : noms explicites en anglais (variables, fonctions, types), fonctions courtes (< 50 lignes idéalement), responsabilité unique.
- **Aucun déchet** :
  - Pas de `console.log` oublié dans le code applicatif. `console.error`/`console.warn` ok dans les catch légitimes.
  - Pas de TODO / FIXME sans note dans la PR.
  - Pas de code mort, pas d'`import` inutile.
- **Gestion d'erreurs exhaustive** :
  - Routes API : try/catch global, retour `NextResponse.json({ message: "..." }, { status: <code> })` avec message FR. Pour les erreurs i18n-friendly : ajouter un `code: "<errorCode>"` traduit côté composant.
  - Helpers lib : throw avec contexte, le caller décide quoi faire.
  - Pas de `catch {}` vide. Pas de `catch { return null }` sans log.
- **Pas de feature flag improvisé**, pas de shim de compatibilité non demandé.

### Pendant l'écriture

- `Edit` sur les fichiers existants, `Write` uniquement pour les nouveaux.
- Après chaque fichier touché, te poser : « est-ce que cette modif respecte la checklist ci-dessus ? ». Si non, corriger avant de passer au suivant.
- Si tu crées un nouveau pattern (helper, abstraction), vérifier qu'il n'existe pas déjà ailleurs (`Grep` sur le repo).

### Validation de l'étape 2

```bash
# Type check global (obligatoire)
npx tsc --noEmit

# Lint (obligatoire — `npm run lint` est cassé)
npx eslint src

# Si une modif Prisma → migration + regen (jamais db push)
npm run db:migrate -- --name <nom_de_la_migration>
# OU pour drop/rename non-interactif : hand-write SQL puis `npx prisma migrate deploy && npx prisma generate`

# (Optionnel mais recommandé) build complet
npm run build
```

`tsc --noEmit` doit retourner exit 0. `eslint` doit retourner exit 0. Toute migration appliquée doit être commitée.

## Étape 3 — Tests destructifs

Posture mentale : **tu attaques ta propre implémentation**. Objectif : la casser. Si tu n'arrives pas à la casser après avoir épuisé les vecteurs ci-dessous, alors elle est validée.

Utilise `templates/tests-report.md`. Un test passe seulement si tu décris l'action exacte (commande `curl` ou parcours UI), l'attente et l'observation.

### Vecteurs obligatoires à couvrir

#### A. Auth & autorisation

- **Route admin sans cookie de session** (`/api/admin/**` + pages `/admin/**` hors `/admin/login`) : 401 JSON ou redirect vers `/admin/login`.
- **Route admin avec un cookie expiré ou invalide** : 401 ou redirect.
- **Page `/admin/login` accessible sans session** : 200 (c'est le bypass voulu dans `proxy.ts`).
- **Routes publiques d'engagement sans rate-limit** : ne devrait pas exister — toute mutation publique = `checkRateLimit`.

#### B. Validation des inputs

- Champs requis manquants (Zod) → 422 avec body `{ message, issues }`.
- Mauvais type : `subject: "invalide"` sur `/api/contact` (enum Zod refuse).
- Payload géant : 1 Mo de message → tronqué ou 422 selon les `max(...)` Zod.
- Caractères spéciaux : emoji, RTL, null bytes, quotes, backslashes — vérifier persist + render.
- JSON corrompu (`{"a":`) → 400 propre.
- Honeypot rempli (`website: "spam"`) → 200 silencieux, pas d'insertion DB.
- Slug invalide sur création projet/blog (`SLUG.INVALID`) → 422.

#### C. Sécurité

- **XSS** : tester `<script>alert(1)</script>` dans `pseudo` et `message` d'un commentaire approuvé. React échappe par défaut tout enfant text — vérifier qu'il n'y a pas de `dangerouslySetInnerHTML` introduit (sauf JSON-LD).
- **SQL injection** : Prisma protège via paramétrage. Si une route utilise `$queryRaw` avec template tag, c'est OK ; concaténation string = faille. `grep -rn "\$queryRaw" src/` doit montrer uniquement des tagged templates.
- **Secrets dans logs** : grep la sortie de `npm run dev` pour `Bearer `, `RESEND_API_KEY`, `password`, `MATOMO_API_TOKEN`. Si trouvé en clair, fix.
- **IP brute en DB** : `SELECT ipAddress FROM ContactMessage LIMIT 5` — `ipAddress` historique tolérée (table contact existe avant le hash) ; toute nouvelle table d'engagement (`BlogPostLike`, `BlogComment`) doit avoir `ipHash` uniquement.
- **Pepper exposé** : `grep -rn "IP_HASH_PEPPER" src/` ne doit PAS retourner de valeur en dur. Le pepper vient de `process.env.IP_HASH_PEPPER`.
- **Honeypot fonctionnel** : envoyer un POST avec `website: "http://spam"` sur `/api/contact` ou `/api/blog/[slug]/comments` → 200 silencieux, **rien** persisté en DB.

#### D. Concurrence & idempotence

- **Toggle like rapide-rapide** : double-clic sur le coeur → état final cohérent (1 like, pas 2 lignes en DB). Vérifier `SELECT COUNT(*) FROM BlogPostLike WHERE postId=<id> AND ipHash=<hash>` ≤ 1.
- **Vue dédoublonnée** : F5 répété sur un article → `viewCount` ne s'incrémente qu'une fois par 24h pour la même IP (rate-limit DB).
- **Submit form contact répété** : 5 envois OK, 6e → 429 avec `code: "rateLimited"`.
- **Submit comment répété** : 3 envois OK / heure / IP, 4e → 429.
- **Re-seed** : `npm run db:seed` est idempotent — relancer ne duplique ni admin ni projets ni articles.

#### E. Edge cases métier

- **Article non publié** (`published=false`) → `/blog/<slug>` renvoie la 404 stylisée.
- **Article avec `publishedAt` futur** → invisible publiquement jusqu'à la date.
- **Commentaires désactivés** (`commentsEnabled=false`) → form caché, message i18n affiché. POST direct → 403 `{ code: "commentsDisabled" }`.
- **Locale switcher** : passer FR → EN sur chaque page (home, projects, projects/[slug], blog, blog/[slug], uses, /contact). Aucune string FR ne doit rester côté EN, et inversement.
- **404 stylisée** : `/abc`, `/blog/inexistant`, `/en/foo` → page 404 avec Header/Footer/Starfield, locale courante respectée.
- **Sitemap** : `curl -s http://localhost:3000/sitemap.xml | grep -c "<url>"` matche bien le nombre attendu (FR + EN par URL).
- **RSS** : `curl -s http://localhost:3000/blog/rss.xml` valide en XML, contient les articles publiés.
- **Empty states** : 0 commentaires → message i18n. 0 projets en DB → message d'invitation au seed.

#### F. Persistance

- Après contact OK : `SELECT id, name, email, subject FROM ContactMessage ORDER BY createdAt DESC LIMIT 1` → 1 ligne.
- Après like : `SELECT id, postId, ipHash FROM BlogPostLike ORDER BY createdAt DESC LIMIT 1` + `SELECT likeCount FROM BlogPost WHERE id=<postId>` cohérent.
- Après vue : `SELECT viewCount FROM BlogPost WHERE id=<postId>` incrémenté de 1, et entrée dans `RateLimit` avec key `view:<postId>:<ipHash>`.
- Après commentaire : `SELECT pseudo, status FROM BlogComment ORDER BY createdAt DESC LIMIT 1` → `status='pending'`.
- Approve admin → `SELECT status FROM BlogComment WHERE id=<id>` → `'approved'` ; le commentaire apparaît côté public.
- Suppression article admin → `SELECT COUNT(*) FROM BlogComment WHERE postId=<deleted>` → 0 (cascade), idem `BlogPostLike`.

### Outillage

```bash
# Stack dev
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml logs --tail=100 db

# DB read-only
docker exec portfolio_db mysql -uportfolio -pchangeme portfolio -e "SHOW TABLES;"
docker exec portfolio_db mysql -uportfolio -pchangeme portfolio -e "SELECT slug, published, viewCount, likeCount FROM BlogPost;"

# Cookie admin (pour /api/admin/**)
# Récupérer depuis le browser après login sur /admin/login, ou via curl + form NextAuth
curl -c /tmp/admin.txt -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "content-type: application/x-www-form-urlencoded" \
  -d "email=$ADMIN_EMAIL&password=$ADMIN_PASSWORD&csrfToken=<...>"
curl -b /tmp/admin.txt http://localhost:3000/admin/blog

# Routes publiques
URL=http://localhost:3000

# Vue + like
curl -X POST $URL/api/blog/<slug>/view
curl -X POST $URL/api/blog/<slug>/like

# Contact
curl -X POST -H "content-type: application/json" \
  -d '{"name":"Test","email":"t@t.fr","subject":"projet","message":"bonjour bonjour"}' \
  $URL/api/contact

# Commentaire
curl -X POST -H "content-type: application/json" \
  -d '{"pseudo":"Test","message":"hello world"}' \
  $URL/api/blog/<slug>/comments
```

### Règle absolue

**Si UN SEUL test échoue ou produit un comportement non documenté, retour à l'étape 2.** Pas de "c'est un edge case ignorable", pas de "on verra plus tard". Corriger, puis rejouer **tous** les tests, pas seulement celui qui a échoué (régression possible).

### Validation de l'étape 3

Le rapport `templates/tests-report.md` est rempli :
- Au moins un test par vecteur applicable au scope de la tâche.
- Chaque ligne a action / attente / observation / verdict.
- Tous les verdicts sont ✅. Aucun ❌.

Affiche le rapport rempli à l'utilisateur avant de passer à l'étape 4.

## Étape 4 — Pull Request GitHub

### Préparation

1. `git status` — confirmer que seuls les fichiers prévus dans le plan sont modifiés.
2. `git diff` — relire l'intégralité du diff. Chercher : `console.log` oublié, secrets en dur (regex `(sk-|sk_|password|secret|RESEND_API_KEY|MATOMO_API_TOKEN).*=.*["']`), formatage cassé, `// @ts-ignore` non justifié, IP brute persistée.
3. `git add <fichiers explicites>` — **jamais** `git add .` ni `git add -A`. `.env` est dans `.gitignore` mais d'autres artefacts peuvent traîner.
4. `git commit` avec message conventional commits FR :
   ```
   <type>(<scope optionnel>): <sujet à l'impératif présent>

   <corps optionnel — pourquoi, pas quoi>

   Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
   ```
   Scopes courants : `blog`, `comments`, `engagement`, `contact`, `projects`, `admin`, `i18n`, `seo`, `sitemap`, `prisma`, `auth`, `home`, `uses`.
5. Push : `git push -u origin <branche>`.

### Création de la PR

Utiliser `gh pr create` avec le template `templates/pr-body.md` rempli.

- **Titre** : conventional commits FR, < 70 caractères. Pas de mention IA dans le titre.
- **Description** : remplir TOUTES les sections du template. Concis, factuel, actionnable.

### Validation de l'étape 4

`gh pr create` retourne une URL. L'afficher à l'utilisateur. **Ne pas merger** — la PR est à reviewer.

## Étape 5 — Review automatique

Lancer un agent de review via `Agent(subagent_type: "nextjs-code-reviewer")`. L'agent est défini dans `.claude/agents/nextjs-code-reviewer.md`.

### Prompt de review (à adapter)

```
Tu reviewes la PR #<numéro> de ce repo Next.js portfolio, branche <branche>.

Fichiers modifiés :
<liste git diff --name-only main...HEAD>

Charge .claude/rules/*.md et CLAUDE.md à la racine pour les invariants.
Suis ta grille (🔴 / 🟠 / 🟡) et rends ton rapport selon le template
.claude/skills/pipeline/templates/review-report.md.

Si une seule entrée 🔴 ou 🟠, verdict REJETÉ.
```

### Pendant la review

- Pendant que l'agent tourne, ne fais rien — n'anticipe pas, ne pré-corrige pas. Laisse-le finir.
- Quand il rend son rapport, le copier dans la conversation et l'attacher à la PR :
  ```bash
  gh pr comment <numéro> --body "$(cat /tmp/review-report.md)"
  ```

### Validation de l'étape 5

Verdict de la review. Si **VALIDÉ**, conclure. Si **REJETÉ**, étape 6.

## Étape 6 — Boucle de correction

1. Lister les points 🔴 et 🟠 du rapport.
2. Pour chaque point : retour à l'étape 2 (implémentation), correction ciblée.
3. Re-`tsc --noEmit` + `eslint src` après chaque modif.
4. Re-jouer **l'intégralité** des tests destructifs de l'étape 3 (régression possible). Mettre à jour `tests-report.md`.
5. Pousser un nouveau commit : `fix(review): <résumé>` (toujours conventional commits FR).
6. Re-lancer un agent de review (étape 5) avec le contexte mis à jour.
7. Boucler jusqu'à verdict **VALIDÉ**.

**Aucune limite d'itérations.** On sort uniquement quand la review passe sans 🔴 ni 🟠.

### Conclusion

Une fois VALIDÉ :

1. Afficher à l'utilisateur :
   - URL de la PR.
   - Résumé : nombre de commits, nombre d'itérations review, fichiers touchés.
   - Le rapport de review final.
2. **Ne pas merger** — décision humaine.

## Templates disponibles

- `templates/plan.md` — plan d'action de l'étape 1.
- `templates/tests-report.md` — rapport de tests destructifs de l'étape 3.
- `templates/pr-body.md` — description de PR de l'étape 4.
- `templates/review-report.md` — rapport de review de l'étape 5.

## Anti-patterns à éviter absolument

- ❌ "J'ai testé mentalement, ça devrait marcher" → tu dois `curl` / cliquer et observer le status + body / l'écran.
- ❌ "Le test échoue mais c'est un edge case" → c'est précisément ce qu'on teste.
- ❌ "Je fais le commit et la PR maintenant pour gagner du temps" → l'étape 3 n'est pas négociable.
- ❌ "Je supprime ce test qui passe pas" → tu corriges le code, pas le test.
- ❌ "Je modifie en silence un fichier non prévu" → si ça sort du plan, tu re-fais le plan.
- ❌ "L'agent de review est trop sévère" → c'est le but. Tu corriges.
- ❌ "Je merge moi-même la PR" → jamais. Décision humaine.
- ❌ "Je commit `.env`" → vérifier `git status` AVANT chaque `git add`.
- ❌ "Je rajoute la string FR seulement, je ferai EN plus tard" → les 2 fichiers en une passe, sinon clé manquante côté UI.
- ❌ "J'utilise `next/link` dans un composant public" → `@/i18n/navigation` exclusivement côté `[locale]/(public)/**`.
- ❌ "Je stocke l'IP brute" → `hashIp()` sur tout ce qui dédoublonne par IP.
- ❌ "Je fais `prisma migrate reset` pour repartir propre" → c'est dans la deny-list. Tu réfléchis à un workflow non-destructif.
