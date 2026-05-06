---
name: blog-post
description: Use when the user asks to add, edit, publish or unpublish a blog article. Couvre les deux chemins (admin form CRUD vs MDX file dans `content/blog/` importé au seed), le contrat de frontmatter, les champs SEO surchargeables, la gestion `published`/`publishedAt`, la TOC auto-extraite des `##`/`###`, le revalidate ISR et l'invalidation de la cache publique.
---

# Ajouter / éditer un article de blog

## Deux chemins de création

### A. Via l'admin (recommandé pour les articles vivants)

`/admin/blog/new` ou `/admin/blog/<id>/edit` — formulaire complet (`src/components/admin/BlogPostForm.tsx`) qui écrit
directement dans la table `BlogPost`. Section SEO repliable (metaTitle, metaDescription, metaKeywords, ogImage,
canonicalUrl, noIndex). `publishedAt` au format `datetime-local`.

L'API correspondante : `POST /api/admin/blog`, `PATCH /api/admin/blog/[id]`. Validation via `blogPostSchema` (
`src/lib/validations.ts`). Revalidation automatique : `/blog`, `/blog/<slug>`, `/sitemap.xml`.

### B. Via un fichier MDX seedé

Pour les articles "long-form" qu'on veut versionner avec git :

```
content/blog/<slug>.mdx
```

Frontmatter exigé :

```yaml
---
title: "Titre de l'article"
description: "Résumé court (5-300 caractères)"
publishedAt: "2026-04-15"            # ISO date
tags: [ "nextjs", "shaders" ]
coverImage: "/blog/cover-foo.png"     # optionnel
metaTitle: "..."                      # optionnel — fallback sur title
metaDescription: "..."                # optionnel — fallback sur description
noIndex: false                        # optionnel
---

# Titre H1 (souvent omis car déjà dans le hero de la page)

## Première section

Contenu MDX standard. Les `##` et `###` sont auto-extraits dans la TOC sticky.
```

Le seed (`prisma/seed.mjs`) lit chaque MDX, parse le frontmatter et `upsert` dans `BlogPost` keyed par `slug`.
Idempotent — relancer `npm run db:seed` met à jour les articles existants.

## Champs DB (`BlogPost`)

```
slug             unique, snake-case-only
title, description, content (MDX raw), coverImage (nullable)
tags             Json (string[])

// SEO surchargeables (fallback sur title/description si null)
metaTitle, metaDescription, metaKeywords, ogImage, canonicalUrl, noIndex

// Publishing
published        bool (par défaut false → invisible publiquement)
publishedAt      DateTime? — date affichée + utilisée pour le tri

// Engagement (lecture seule depuis l'éditeur, modifiables via /admin/blog)
viewCount, likeCount, commentsEnabled

createdAt, updatedAt
```

`getAllPosts()` filtre `published = true AND publishedAt <= now()`. Un article avec `publishedAt` futur n'apparaît pas (
publication différée gratuite).

## SEO

`generateMetadata` côté `[locale]/(public)/blog/[slug]/page.tsx` applique cette priorité :

- `metaTitle ?? title`
- `metaDescription ?? description`
- `ogImage ?? coverImage`
- `canonicalUrl ?? <baseUrl><localePrefix>/blog/<slug>`
- `noIndex` → `robots: { index: false, follow: false }`

JSON-LD `BlogPosting` injecté avec `wordCount`, `articleSection` (1er tag), `timeRequired` (PT<minutes>M).

## Reading time + TOC

Calculés à la lecture par `src/lib/blog.ts` :

- `readingTime` : `wordCount / 200` arrondi (min 1).
- `toc` : extraction regex des `##`/`###` du MDX brut, dans l'ordre, avec slugs via `github-slugger`.

Pas besoin d'écrire la TOC manuellement — elle apparaît dans la sidebar sticky.

## Engagement par défaut

Tout nouvel article a :

- `viewCount = 0`, `likeCount = 0`
- `commentsEnabled = true`

Les visiteurs voient immédiatement le bouton like et le formulaire de commentaire (en attente de modération admin). Pour
couper les commentaires : toggle dans `/admin/blog` ou via `PATCH /api/admin/blog/<id>/engagement`.

## Workflow type — ajouter un article

```bash
# Option A : admin
# 1. /admin/blog/new
# 2. Remplir titre / slug / description / contenu MDX / tags
# 3. (Optionnel) Section SEO + ogImage
# 4. publishedAt → maintenant ou date future
# 5. published = true → publier

# Option B : MDX
# 1. Créer content/blog/<slug>.mdx avec frontmatter complet
# 2. npm run db:seed                      # idempotent : upsert keyed par slug
# 3. (Si besoin) curl revalidate ou redémarrer next dev
```

## Workflow type — éditer un article

- Si l'article a été créé via l'admin → l'éditer via l'admin.
- Si l'article a été créé via MDX seedé → éditer le fichier `.mdx` puis `npm run db:seed` (l'`upsert` met à jour).
  Attention : si l'admin a édité l'article entre-temps, ces modifications seront écrasées par le contenu du MDX.

## Pièges

- **Slug en kebab-case ASCII uniquement** : la regex Zod `/^[a-z0-9-]+$/`. Pas d'accents, pas d'underscores, pas de
  majuscules.
- **`publishedAt` requis pour publier** : `published = true` mais `publishedAt = null` → l'article reste invisible (
  filtre `lte: new Date()`).
- **Cache ISR (`revalidate = 60`)** : après une édition admin, la page publique se rafraîchit dans la minute. Pour
  forcer immédiat : `revalidatePath('/blog/<slug>')` (déjà fait dans les routes admin).
- **`coverImage` doit pointer vers un fichier de `/public/`** ou une URL absolue HTTPS. Pas d'upload géré pour l'
  instant — déposer manuellement dans `public/blog/`.
- **MDX malformé** : si shiki / rehype-pretty-code n'arrive pas à parser un bloc de code, la page entière 500 en prod.
  Tester en dev avant publication.
- **TOC ne capture que `##` et `###`** — les `####` et plus profonds sont ignorés.
- **Tags** : array de strings dans le JSON Prisma. Côté code, valider runtime :
  `Array.isArray(p.tags) ? p.tags as string[] : []`.

## Vérifications post-publication

```bash
# La page se charge en FR + EN
curl -sI http://localhost:3000/blog/<slug>
curl -sI http://localhost:3000/en/blog/<slug>

# Le sitemap référence l'article (les 2 locales)
curl -s http://localhost:3000/sitemap.xml | grep <slug>

# Le RSS contient l'article
curl -s http://localhost:3000/blog/rss.xml | grep <slug>

# Le JSON-LD BlogPosting est bien injecté (View Source)
curl -s http://localhost:3000/blog/<slug> | grep -A2 'BlogPosting'
```
