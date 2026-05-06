## Résumé

<2-3 phrases : ce que la PR change et pourquoi (le « pourquoi », pas le « quoi » — le diff montre le quoi).>

## Type
- [ ] `feat` — nouvelle fonctionnalité
- [ ] `fix` — correction de bug
- [ ] `refactor` — refonte sans changement de comportement
- [ ] `chore` — maintenance (deps, config)
- [ ] `perf` — perf
- [ ] `docs` — doc

## Surface touchée

- [ ] Pages publiques (`src/app/[locale]/(public)/...`)
- [ ] Pages admin (`src/app/(admin)/admin/...`)
- [ ] Routes API publiques (`src/app/api/...`)
- [ ] Routes API admin (`src/app/api/admin/...`)
- [ ] Helpers lib (`src/lib/...`)
- [ ] Composants (`src/components/...`)
- [ ] Schéma Prisma + migration
- [ ] Traductions `src/messages/{fr,en}.json`
- [ ] Sitemap / JSON-LD / metadata SEO
- [ ] Auth (`src/lib/auth.ts`, `src/proxy.ts`)
- [ ] Config (`next.config.ts`, `tsconfig.json`, `package.json`, `eslint.config.mjs`)
- [ ] Content MDX (`content/blog/...`)

## Schéma Prisma

- [ ] Aucune modif
- [ ] Migration ajoutée : `prisma/migrations/<timestamp>_<name>/migration.sql`
- [ ] Hand-write SQL (drop / rename avec données) — réversible ? OUI/NON

```sql
-- résumé du change SQL si non-trivial
```

## Routes touchées

| Méthode | URL | Handler | Auth | Rate-limit | Note |
|---|---|---|---|---|---|
| POST | `/api/...` | `route.ts::POST` | publique / `getAdminSession` | clé + fenêtre | <note> |

## Smoke tests joués

(résumé du `tests-report.md` — détails dans le commit ou en commentaire de PR)

```bash
# Exemples de commandes ayant servi à valider
curl -X POST -H "content-type: application/json" \
  -d '{"name":"Test","email":"t@t.fr","subject":"projet","message":"bonjour bonjour"}' \
  http://localhost:3000/api/contact

curl -X POST http://localhost:3000/api/blog/<slug>/like
```

- ✅ Auth : route admin sans cookie / `/admin/login` accessible
- ✅ Validation : Zod (champs / types / size / honeypot)
- ✅ Sécurité : XSS / pas de `$queryRaw` concaténé / pas de secret dans logs / IP hashée
- ✅ Concurrence : double like / F5 view / spam contact / spam comment
- ✅ Edge cases : article non publié / locale switch / 404 / sitemap / RSS
- ✅ Persistance : `BlogPostLike` unique / `BlogComment.status` transitions / cascade delete

## i18n

- [ ] Aucune string ajoutée
- [ ] Clés ajoutées dans `fr.json` ET `en.json` simultanément (cocher les 2)

## SEO

- [ ] Aucun impact SEO
- [ ] `generateMetadata` ajouté avec `alternates.languages` (FR + EN + x-default)
- [ ] JSON-LD ajouté (`<type schema.org>`)
- [ ] Sitemap mis à jour (entrée double FR/EN avec hreflang)
- [ ] `revalidatePath()` appelé après mutation admin

## Build & types

- ✅ `npx tsc --noEmit` — exit 0
- ✅ `npx eslint src` — exit 0
- ✅ `npm run build` (optionnel mais recommandé)

## Rollback

```bash
git revert <sha>
# si modif Prisma : créer une migration "revert" qui annule le change
# (les migrations versionnées sont commitées — pas de revert magique)
```

## Points d'attention pour le reviewer

- <fichier:ligne> : décision non-évidente expliquée ici
- <invariant à conserver vs liberté qu'on s'autorise>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
