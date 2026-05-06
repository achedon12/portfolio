---
name: prisma-migration
description: Use when the user asks to change the database schema in this project — add/remove a model, add/rename/drop a column, change a default, add an index, modify an enum. Couvre les conventions du repo (Prisma 6 + MySQL 9 + auto-increment Int IDs, migrations versionnées commitées) et les gotchas connues (`migrate dev` interactif sur drop/rename, client Prisma caché par le dev server, grant shadow DB MySQL 9).
---

# Modifier le schéma Prisma

## Spécificités du projet

- **Outil** : Prisma 6 (`@prisma/client` 6.x). Fichier : `prisma/schema.prisma`. Config supplémentaire :
  `prisma.config.ts` (charge `.env`).
- **DB** : MySQL 9 (image `mysql:9` en docker compose), schéma `portfolio`. Port dev `localhost:3308`.
- **IDs** : auto-increment `Int` (`Int @id @default(autoincrement())`) — **différent du standard Prisma cuid** mais
  c'est la convention du repo. Conserver ce style sur les nouveaux modèles.
- **Timestamps** : `createdAt DateTime @default(now())` + `updatedAt DateTime @updatedAt` quand mutable.
- **Soft delete** : pas utilisé. Les suppressions sont `onDelete: Cascade` via les relations.
- **JSON columns** : `Project.gallery`, `Project.techStack`, `BlogPost.tags` — déclarés `Json?` ou `Json`. Côté code,
  validation runtime requise (`Array.isArray(p.tags) ? p.tags as string[] : []`).
- **Indexes** : `@@index([slug])` quand la colonne sert de point d'entrée fréquent, `@@index([published, publishedAt])`
  pour les requêtes filtrées+triées.
- **`@db.Text`** pour les textes longs (description, message). `@db.LongText` pour content MDX, transcripts.
  `@db.VarChar(N)` pour les hashes / statuts courts.
- **Engagement system** : `BlogPost` a `viewCount`, `likeCount`, `commentsEnabled`. Les likes vont dans `BlogPostLike` (
  `@@unique([postId, ipHash])`), les commentaires dans `BlogComment` (`status` "pending" | "approved" | "spam").

## Workflow standard (migrations versionnées)

Le repo utilise les migrations versionnées commitées sous `prisma/migrations/`. Pas de `db push`.

```bash
# 1. Éditer prisma/schema.prisma

# 2. Générer + appliquer en dev
npm run db:migrate -- --name nom_de_la_migration
# = prisma migrate dev --name nom_de_la_migration
# Crée prisma/migrations/<timestamp>_nom_de_la_migration/migration.sql, l'applique, regénère le client.

# 3. Commit la migration
git add prisma/migrations/<timestamp>_nom_de_la_migration/

# 4. Redémarrer next dev (le client Prisma est cached côté Node)
```

En prod, l'`entrypoint.sh` du conteneur app exécute automatiquement `prisma migrate deploy` puis `prisma db seed` au
démarrage.

## Workflow non-interactif (drop / rename column avec données)

`prisma migrate dev` exige une confirmation interactive quand il détecte une perte de données potentielle (drop column,
rename, etc.). En CI ou en script Claude, ça bloque. Solution : **hand-write le SQL**.

```bash
TS=$(date +%Y%m%d%H%M%S)
mkdir -p prisma/migrations/${TS}_<name>
cat > prisma/migrations/${TS}_<name>/migration.sql <<'EOF'
-- Toujours préserver les données : utiliser CHANGE COLUMN, ALTER TABLE ... MODIFY,
-- ou des UPDATE de backfill avant DROP.
ALTER TABLE `BlogPost` CHANGE COLUMN `oldName` `newName` BOOLEAN NOT NULL DEFAULT true;
EOF

# Appliquer + regénérer le client
npx prisma migrate deploy
npx prisma generate
```

Référence directe : `prisma/migrations/20260506153656_swap_giscus_for_native_comments/migration.sql` (rename
`giscusEnabled` → `commentsEnabled` sans perte).

## Conventions modèle

```prisma
model Foo {
  id        Int      @id @default(autoincrement())
  slug      String   @unique
  ownerId   Int?     // optionnel pour des modèles publics
  status    String   @default("pending") @db.VarChar(16)
  payload   Json?    
  ipHash    String   @db.VarChar(64) // pour tout ce qui dédoublonne par IP
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([slug])
  @@index([status, createdAt])
}
```

## Engagement IP-hashed — pattern

Toute table qui dédoublonne par IP suit ce schéma :

```prisma
model XxxLike {
  id        Int      @id @default(autoincrement())
  postId    Int      
  ipHash    String   @db.VarChar(64)
  createdAt DateTime @default(now())

  post BlogPost @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([postId, ipHash])
  @@index([postId])
}
```

Toujours `onDelete: Cascade` sur la relation parent → enfant pour que la suppression du post nettoie ses likes/comments.

## Pièges connus

- **Shadow DB grant** : MySQL 9 + `prisma migrate dev` exige des privilèges étendus pour la *shadow database*. À faire
  une fois au premier setup :
  ```bash
  docker exec portfolio_db mysql -uroot -p$MYSQL_ROOT_PASSWORD \
    -e "GRANT ALL PRIVILEGES ON *.* TO 'portfolio'@'%' WITH GRANT OPTION; FLUSH PRIVILEGES;"
  ```
- **Prisma client caché** : après une migration qui ajoute des colonnes, les nouveaux champs reviennent `undefined` tant
  que `next dev` n'est pas relancé. Pendant la transition, ajouter des `?? defaultValue` dans `src/lib/blog.ts` / les
  composants pour ne pas crasher.
- **Migrate reset interdit** : `npx prisma migrate reset` est dans la deny-list. Si la DB dev est cassée :
  `docker compose -f docker-compose.dev.yml down`, supprimer le volume manuellement, `up`, regrant.
- **Renommer une colonne avec `migrate dev`** prompt interactivement → utiliser le workflow hand-write SQL.
- **Touchés au type d'un champ** : MySQL traduit Prisma en types SQL natifs. Modifier `String` → `Json` peut tronquer
  côté DB. Faire en 2 migrations : nouvelle colonne, backfill, suppression de l'ancienne.
- **Index composé** : déclarer dans l'ordre `WHERE`-puis-`ORDER BY`. Ex : `@@index([published, publishedAt])` couvre
  `WHERE published = true ORDER BY publishedAt DESC`.

## Vérifications après changement

```bash
npx prisma validate                  # le schéma doit être valide
npx prisma generate                  # le client doit re-générer
npx tsc --noEmit                     # le code consommateur doit compiler
```

Et pour les nouvelles routes API qui consomment le modèle, voir le skill `next-api-route`.
