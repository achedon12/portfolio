# `.claude/` — Configuration projet pour Claude Code

Ce dossier contient les guides, skills et agents spécifiques au projet pour Claude Code travaillant dans ce repo.

## Layout

- `settings.json` — pré-autorise les commandes courantes (npm, prisma migrate, docker dev, mysql lecture seule via
  `portfolio_db`, curl localhost, git, gh, openssl) et bloque les destructives (`rm -rf prisma/migrations`,
  `rm -rf src`, `down -v`, `prisma migrate reset`, `db push --force-reset`, `force push`, `reset --hard`,
  `DROP DATABASE`, `TRUNCATE`). Les autres commandes déclenchent un prompt classique.
- `settings.local.json` — préférences personnelles (non versionné, créé localement si besoin).
- `rules/` — règles d'architecture chargées automatiquement par Claude Code. 4 fichiers always-loaded (`commands`,
  `architecture`, `conventions`, `operational`) + 4 fichiers scopés via frontmatter `paths:` (`i18n`, `blog-engagement`,
  `seo`, `env`).
- `skills/` — skills déclenchables. Chaque sous-dossier a un `SKILL.md` avec frontmatter (`name`, `description`). Claude
  active automatiquement quand la description matche la demande utilisateur.
- `agents/` — sous-agents spécialisés. Invoqués via `Agent(subagent_type: "<name>")`.

## Skills disponibles

| Skill              | Déclenche sur                                                                                                                                                                                                                                                                                   |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `pipeline`         | Slash command `/pipeline <description>` — pipeline complet intransigeant : analyse → implémentation → tests destructifs → PR → review automatique → boucle de correction. Aucune sortie sans `tsc --noEmit` + `eslint src` propres, smoke tests verts et review VALIDÉ. Templates sous `pipeline/templates/`. |
| `i18n-string`      | Ajouter/renommer/supprimer une chaîne UI publique. Couvre les 2 langues (`src/messages/{fr,en}.json`), le choix du namespace, server vs client (`getTranslations` vs `useTranslations`), `setRequestLocale`, et la convention error-codes pour Zod.                                             |
| `prisma-migration` | Modifier le schéma Prisma — ajouter/renommer/supprimer une colonne, un model, un index. Couvre la convention migrations versionnées commitées, le workflow non-interactif (hand-write SQL) pour les drops/renames avec données, le grant shadow DB MySQL 9, et le pattern engagement IP-hashed. |
| `next-api-route`   | Ajouter ou modifier une route API sous `src/app/api/`. Couvre les 2 familles (publique rate-limitée + IP hash vs admin gardée par `getAdminSession`), la validation Zod par codes d'erreur, runtime nodejs, signatures `params`/`searchParams` Next 16, `revalidatePath` après mutation.        |
| `blog-post`        | Ajouter, éditer, publier ou dépublier un article. Couvre les 2 chemins (admin form CRUD vs MDX seedé depuis `content/blog/`), les champs SEO surchargeables, `published`/`publishedAt`, la TOC auto-extraite et l'invalidation ISR.                                                             |

## Agents disponibles

| Agent                  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `nextjs-code-reviewer` | Reviewer TS/Next.js/Prisma intransigeant pour ce repo. Vérifie navigation localisée (`@/i18n/navigation`), parité FR/EN, `setRequestLocale`, validation Zod par codes d'erreur, IP hashing dans les routes engagement, runtime nodejs, sécurité (XSS / SQL / secrets / IDOR admin), JSON-LD + hreflang sur les nouvelles pages publiques. Ne modifie rien — rend un verdict VALIDÉ / REJETÉ avec emplacements précis (`fichier:ligne`). À invoquer avant commit/PR. |

L'architecture détaillée et les conventions vivent dans `CLAUDE.md` à la racine + `.claude/rules/*.md`. Les skills et
agents ici supposent ce contexte.
