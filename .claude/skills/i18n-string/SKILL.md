---
name: i18n-string
description: Use when the user asks to add, rename, or remove a UI string in the public side of the portfolio — anything rendered to a visitor under `[locale]/(public)/**`. Couvre les 2 langues du projet (FR par défaut, EN), les fichiers `src/messages/{fr,en}.json`, le namespace approprié, l'usage server vs client (`getTranslations` vs `useTranslations`), les codes d'erreur Zod, et la règle "ne jamais oublier de mettre à jour les 2 fichiers en même temps".
---

# Ajouter / modifier une chaîne traduite

## Localisation des fichiers

Les messages vivent dans **`src/messages/`** :

- `src/messages/fr.json` (langue par défaut, prioritaire)
- `src/messages/en.json`

**Toute clé ajoutée doit l'être dans les 2 fichiers en une seule modification.** Si une clé manque dans un fichier,
next-intl loggue un warning mais l'UI affiche la clé brute. Le projet n'a que 2 locales — pas d'`es.json`.

## Choix du namespace

Privilégier l'ajout dans un namespace existant à la création d'un nouveau :

| Namespace       | Pour                                                       |
|-----------------|------------------------------------------------------------|
| `Nav`           | Items de navigation (header + footer)                      |
| `Hero`          | Section d'accueil                                          |
| `About`         | Section "à propos" + bio + stats                           |
| `Skills`        | Constellation des compétences (filtres, niveaux, années)   |
| `Timeline`      | Trajectoire (kicker, kind labels, items keyed par id)      |
| `Contact`       | Form contact (labels, sujets, errors codes)                |
| `Footer`        | Pied de page (tagline, navigation, social)                 |
| `Projects`      | Liste / filtres / metaTitle / cartes                       |
| `ProjectDetail` | Page détail projet                                         |
| `Blog`          | Liste articles                                             |
| `BlogPost`      | Article seul (TOC, share, prev/next)                       |
| `Comments`      | Form + liste de commentaires (formTitle, errors, statuses) |
| `Uses`          | Page `/uses` (titres de sections par id)                   |
| `NotFound`      | Page 404                                                   |
| `Common`        | Loading, locale switcher labels                            |

## Server component (page sous `[locale]/(public)/`)

```tsx
import {getTranslations, setRequestLocale} from "next-intl/server";

export default async function MyPage({params}: { params: Promise<{ locale: string }> }) {
    const {locale} = await params;
    setRequestLocale(locale);                 // OBLIGATOIRE pour SSG
    const t = await getTranslations("Hero");
    return <h1>{t("title")}</h1>;
}
```

`generateMetadata` aussi : `await getTranslations({ locale, namespace })`. Ne jamais oublier `setRequestLocale` avant le
1er `getTranslations()` du body de la page.

## Client component (`"use client"`)

```tsx
"use client";
import {useTranslations} from "next-intl";

export function MyButton() {
    const t = useTranslations("Common");
    return <button>{t("loading")}</button>;
}
```

## Navigation localisée

Pour les liens internes : importer **`Link` depuis `@/i18n/navigation`** (jamais `next/link` côté public). Pareil pour
`useRouter`, `usePathname`. Le préfixe `/en` est ajouté automatiquement quand la locale courante est EN.

```tsx
import {Link} from "@/i18n/navigation";   // OUI
// import Link from "next/link";            // NON côté public
```

## Interpolation + pluriels

```json
{
  "yearsOfUse": "{years, plural, one {# an d'usage} other {# ans d'usage}}"
}
```

```tsx
t("yearsOfUse", {years: skill.years});
```

## Date formatting

Côté composant, déduire le format BCP-47 du locale :

```tsx
const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
new Date(iso).toLocaleDateString(dateLocale, {dateStyle: "medium"});
```

Pour la timeline (mois ISO `"YYYY-MM"`), utiliser `formatMonth(iso, locale, presentLabel)` exposé par
`src/lib/timeline.ts`.

## Codes d'erreur (Zod)

Les schémas Zod ne stockent **pas** de messages traduits — ils stockent un **code d'erreur**, traduit côté composant.

```ts
// src/lib/validations.ts
export const contactErrorCodes = {
    nameTooShort: "nameTooShort",
    emailInvalid: "emailInvalid",
    // …
} as const;

export const contactSchema = z.object({
    name: z.string().min(2, contactErrorCodes.nameTooShort).max(80, contactErrorCodes.nameTooLong),
    email: z.string().email(contactErrorCodes.emailInvalid),
});
```

```tsx
// composant
const errorLabel = (code?: string) => code ? t(`errors.${code}`) : undefined;
<p>{errorLabel(errors.email?.message)}</p>
```

Et côté JSON, sous `"<Namespace>.errors": { "<code>": "..." }`.

## Données + traductions

Pour les libs data-only (`src/lib/skills.ts`, `src/lib/timeline.ts`, `src/lib/uses.ts`), **les libellés sont dans les
messages**, pas dans la lib :

- `timeline.ts` ne contient que `id`, `kind`, dates, location, stack. Le `title` / `org` / `description` sont sous
  `Timeline.items.{id}`.
- `skills.ts` ne contient que `id`, `category`, `level`, `years`, position. Le label de catégorie est sous
  `Skills.category.{id}`.
- `uses.ts` contient `name` (universel) + `fr` + `en` directement (cas particulier — descriptions courtes).

## Règle d'or

- **Jamais de string FR/EN en dur dans le JSX public** — toujours via `t(...)`.
- **Exception tolérée** : metadata literals déjà branchés sur `isFr` (titres SEO, OpenGraph), code source des libs
  data-only (skills/timeline/uses) qui exposent des IDs.
- **Exception admin** : tout le tree `(admin)/` est FR-only, pas de `t(...)` requis.

## Quand renommer une clé

1. Renommer dans les 2 fichiers messages.
2. `grep -rn '"<Old.key>"' src/` puis remplacer chaque occurrence.
3. `npx tsc --noEmit` (ne détecte pas les clés manquantes au type level — next-intl les check à l'exécution).
4. Tester visuellement la page concernée en FR + EN.
