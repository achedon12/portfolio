# Rapport de tests destructifs — `<titre tâche>`

Branche : `<nom-de-branche>`
Date : `<YYYY-MM-DD>`

## Préparation

```bash
URL=http://localhost:3000

# Compte admin (créé par le seed)
ADMIN_EMAIL=$(grep ^ADMIN_EMAIL= .env | cut -d= -f2- | tr -d '"')
ADMIN_PASSWORD=$(grep ^ADMIN_PASSWORD= .env | cut -d= -f2- | tr -d '"')

# Cookie admin pour /api/admin/** et pages /admin/**
# Récupérer via /admin/login dans le browser, ou via curl + form NextAuth
COOKIE_ADMIN=/tmp/cookie_admin.txt
```

## A. Auth & autorisation

| # | Action | Attente | Observation | Verdict |
|---|---|---|---|---|
| A1 | `curl -sI $URL/admin` (sans cookie) | 307 redirect vers `/admin/login` | <observé> | ✅ / ❌ |
| A2 | `curl -X PATCH $URL/api/admin/blog/1` (sans cookie) | 401 JSON `{ message: "Unauthorized" }` | <observé> | ✅ / ❌ |
| A3 | `curl -sI $URL/admin/login` (sans cookie) | 200 (bypass voulu) | <observé> | ✅ / ❌ |
| A4 | `curl -b $COOKIE_ADMIN $URL/api/admin/blog` | 200 + liste articles | <observé> | ✅ / ❌ |
| A5 | `curl $URL/api/blog/<slug>/comments` (sans cookie) | 200 + commentaires `approved` (route publique) | <observé> | ✅ / ❌ |

## B. Validation des inputs

| # | Action | Attente | Observation | Verdict |
|---|---|---|---|---|
| B1 | `POST /api/contact` body `{}` | 422 `{ message: "Validation échouée", issues: ... }` | <observé> | ✅ / ❌ |
| B2 | `POST /api/contact` body `{ subject: "invalide", ... }` | 422 (enum Zod refuse) | <observé> | ✅ / ❌ |
| B3 | `POST /api/contact` body avec message > 4000 caractères | 422 (Zod max) | <observé> | ✅ / ❌ |
| B4 | `POST /api/contact` body avec `website: "spam"` (honeypot rempli) | 200 silencieux, **rien** persisté en DB | <observé> | ✅ / ❌ |
| B5 | Caractères spéciaux : pseudo de commentaire `🐺<script>RTL\x00` | persisté + render échappé par React | <observé> | ✅ / ❌ |
| B6 | JSON corrompu (`{"a":`) sur `/api/contact` | 400 propre, pas de 500 | <observé> | ✅ / ❌ |
| B7 | Slug invalide en POST `/api/admin/blog` (`SLUG.WITH.DOTS`) | 422 (regex Zod refuse) | <observé> | ✅ / ❌ |
| B8 | `POST /api/blog/<slug>/comments` body `{}` | 422 (`pseudo` + `message` requis) | <observé> | ✅ / ❌ |

## C. Sécurité

| # | Action | Attente | Observation | Verdict |
|---|---|---|---|---|
| C1 | XSS : commentaire avec `<script>alert(1)</script>` (approuvé) | rendu échappé par React, pas d'exécution JS | <observé> | ✅ / ❌ |
| C2 | XSS : pseudo avec `<img src=x onerror=alert(1)>` | rendu échappé en text | <observé> | ✅ / ❌ |
| C3 | `grep -rn "\$queryRaw" src/` | aucun usage OU uniquement tagged templates | <observé> | ✅ / ❌ |
| C4 | Secrets dans logs : grep stdout du dev server pour `Bearer `, `RESEND_API_KEY`, `MATOMO_API_TOKEN`, `password` | aucun match en clair | <observé> | ✅ / ❌ |
| C5 | IP brute en DB : `SELECT ipAddress FROM ContactMessage LIMIT 5` | tolérée historique. Nouvelles tables (`BlogPostLike`, `BlogComment`) : `SELECT ipHash FROM ...` only | <observé> | ✅ / ❌ |
| C6 | `grep -rn "IP_HASH_PEPPER\s*=" src/` | aucun match (vient toujours de `process.env`) | <observé> | ✅ / ❌ |
| C7 | `dangerouslySetInnerHTML` sur du contenu user | uniquement JSON-LD et HTML 100% trusted | <observé> | ✅ / ❌ |

## D. Concurrence & idempotence

| # | Action | Attente | Observation | Verdict |
|---|---|---|---|---|
| D1 | Double-clic rapide sur ❤️ | `SELECT COUNT(*) FROM BlogPostLike WHERE postId=<id> AND ipHash=<h>` ≤ 1 | <observé> | ✅ / ❌ |
| D2 | F5 répété sur `/blog/<slug>` (5 fois) | `viewCount` += 1 seulement (rate-limit 24h) | <observé> | ✅ / ❌ |
| D3 | 5× `POST /api/contact` rapides | les 5 OK, le 6e → 429 `{ code: "rateLimited" }` | <observé> | ✅ / ❌ |
| D4 | 3× `POST /api/blog/<slug>/comments` rapides | les 3 OK, le 4e → 429 | <observé> | ✅ / ❌ |
| D5 | `npm run db:seed` rejoué 2x | idempotent — pas de doublon admin / projets / articles | <observé> | ✅ / ❌ |

## E. Edge cases métier

| # | Action | Attente | Observation | Verdict |
|---|---|---|---|---|
| E1 | Article `published=false` → `/blog/<slug>` | page 404 stylisée | <observé> | ✅ / ❌ |
| E2 | Article `publishedAt` futur → `/blog/<slug>` | 404 jusqu'à la date | <observé> | ✅ / ❌ |
| E3 | `commentsEnabled=false` côté article : form caché + `POST /comments` direct | message i18n + 403 `{ code: "commentsDisabled" }` | <observé> | ✅ / ❌ |
| E4 | Switch FR → EN sur `/`, `/projects`, `/projects/<slug>`, `/blog`, `/blog/<slug>`, `/uses` | aucune string FR ne reste côté EN | <observé> | ✅ / ❌ |
| E5 | Switch EN → FR (reverse) | aucune string EN ne reste côté FR | <observé> | ✅ / ❌ |
| E6 | Routes inconnues : `/abc`, `/blog/inexistant`, `/en/foo` | page 404 stylisée avec Header/Footer/Starfield, locale courante respectée | <observé> | ✅ / ❌ |
| E7 | `curl -s $URL/sitemap.xml \| grep -c "<url>"` | nombre cohérent (FR + EN par URL) | <observé> | ✅ / ❌ |
| E8 | `curl -s $URL/blog/rss.xml` | XML valide, articles publiés présents | <observé> | ✅ / ❌ |
| E9 | Empty state : DB sans commentaires sur l'article | message i18n affiché, pas de crash | <observé> | ✅ / ❌ |

## F. Persistance

| # | Action | Attente | Observation | Verdict |
|---|---|---|---|---|
| F1 | Après `POST /api/contact` OK : `SELECT id, name, email, subject FROM ContactMessage ORDER BY createdAt DESC LIMIT 1` | 1 ligne avec les bons champs | <observé> | ✅ / ❌ |
| F2 | Après like : `SELECT COUNT(*) FROM BlogPostLike WHERE postId=<id>` + `SELECT likeCount FROM BlogPost WHERE id=<id>` | counts cohérents | <observé> | ✅ / ❌ |
| F3 | Après vue : `SELECT viewCount FROM BlogPost WHERE id=<id>` | += 1, et `SELECT key FROM RateLimit WHERE key LIKE 'view:%'` présent | <observé> | ✅ / ❌ |
| F4 | Après commentaire : `SELECT pseudo, status FROM BlogComment ORDER BY createdAt DESC LIMIT 1` | `status='pending'` | <observé> | ✅ / ❌ |
| F5 | Approve admin : `SELECT status FROM BlogComment WHERE id=<id>` | `'approved'`, et le commentaire apparaît côté public | <observé> | ✅ / ❌ |
| F6 | Suppression article admin : `SELECT COUNT(*) FROM BlogComment WHERE postId=<deletedId>` + idem `BlogPostLike` | 0 (cascade Prisma) | <observé> | ✅ / ❌ |

## Résultat global

- **Vecteurs couverts** : A, B, C, D, E, F (cocher les applicables au scope de la tâche)
- **Tests passés** : `<n>/n`
- **Tests échoués** : `0` (sinon → retour étape 2)

✅ **Tous verts.** Pipeline → étape 4.
