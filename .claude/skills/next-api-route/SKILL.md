---
name: next-api-route
description:
  Use when the user asks to add or modify a Next.js App Router API route under `src/app/api/`. Couvre les conventions du repo: 2 familles de routes (publiques rate-limitées par IP hashée vs admin gardées par `getAdminSession()`), validation Zod avec error codes, runtime nodejs, signatures async pour `params`/`searchParams` (Next 16), `revalidatePath` après mutation, et les pièges sur les transactions + IP hashing.
---

# Ajouter une route API

## Deux familles de routes

| Famille      | Path                        | Auth                                      | Rate-limit                                       | Exemples                                                                              |
|--------------|-----------------------------|-------------------------------------------|--------------------------------------------------|---------------------------------------------------------------------------------------|
| **Publique** | `src/app/api/<slug>/`       | aucune                                    | `checkRateLimit(...)` obligatoire pour mutations | `/api/contact`, `/api/blog/[slug]/{view,like,comments}`                               |
| **Admin**    | `src/app/api/admin/<slug>/` | `getAdminSession()` (renvoie 401 si null) | facultatif                                       | `/api/admin/blog`, `/api/admin/blog/[id]/engagement`, `/api/admin/blog/comments/[id]` |

Ne pas mélanger : une route publique ne doit jamais appeler `getAdminSession()`, une route admin ne doit pas être sous
`src/app/api/` directement.

## Squelette route publique mutating

```ts
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {someSchema} from "@/lib/validations";
import {checkRateLimit, getClientIp} from "@/lib/rate-limit";
import {hashIp} from "@/lib/ip-hash";

export const runtime = "nodejs";

interface Ctx {
    params: Promise<{ slug: string }>;
}

export async function POST(req: Request, {params}: Ctx) {
    const {slug} = await params;

    // 1. Parse JSON
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({message: "Body JSON invalide"}, {status: 400});
    }

    // 2. Valide via Zod (messages = error codes, pas de strings traduits)
    const parsed = someSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            {message: "Validation échouée", issues: parsed.error.flatten()},
            {status: 422},
        );
    }

    // 3. Honeypot si applicable (champ caché qui doit rester vide)
    if (parsed.data.website && parsed.data.website.length > 0) {
        return NextResponse.json({ok: true}, {status: 200}); // silencieux pour ne pas signaler
    }

    // 4. Rate-limit IP-hashée
    const ipHash = hashIp(getClientIp(req));
    const rl = await checkRateLimit(`<surface>:${ipHash}`, 5, 60 * 60 * 1000); // 5/h ici
    if (!rl.ok) {
        return NextResponse.json(
            {code: "rateLimited", message: "Trop de requêtes. Réessaie plus tard."},
            {status: 429},
        );
    }

    // 5. Persist (jamais l'IP brute, toujours le hash)
    await prisma.foo.create({
        data: {
            ...parsed.data,
            ipHash,
        },
    });

    return NextResponse.json({ok: true}, {status: 201});
}
```

## Squelette route admin

```ts
import {NextResponse} from "next/server";
import {revalidatePath} from "next/cache";
import {prisma} from "@/lib/prisma";
import {getAdminSession} from "@/lib/auth";

export const runtime = "nodejs";

interface Ctx {
    params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, {params}: Ctx) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({message: "Unauthorized"}, {status: 401});

    const {id} = await params;
    const itemId = Number(id);
    if (!Number.isFinite(itemId)) {
        return NextResponse.json({message: "Invalid id"}, {status: 400});
    }

    const body = (await req.json().catch(() => ({}))) as { /* … */ };

    const updated = await prisma.foo.update({
        where: {id: itemId},
        data: { /* … */},
        select: { /* champs nécessaires pour la revalidation */},
    });

    // Toujours invalider la cache des pages publiques impactées
    revalidatePath(`/blog/${updated.slug}`);
    return NextResponse.json({ok: true});
}
```

## Conventions

- **`runtime = "nodejs"`** par défaut. Ne pas utiliser `edge` — Prisma + Resend/Nodemailer + `node:crypto` (pour
  `hashIp`) ne tournent pas sur edge.
- **`params` et `searchParams` sont des `Promise<...>`** dans Next 16. Toujours `await`.
- **Body parsing** : `await req.json().catch(() => null)` puis Zod `safeParse`. Pour FormData : `await req.formData()`.
- **Validation** : Zod (`zod`). Schémas dans `src/lib/validations.ts`. Messages = **codes d'erreur** (`"nameTooShort"`),
  pas de string traduit.
- **IP** : toujours `hashIp(getClientIp(req))` via `src/lib/ip-hash.ts`. Stocker `ipHash` dans la table, jamais l'IP
  brute.
- **Rate-limit** : `checkRateLimit(key, max, windowMs)` via `src/lib/rate-limit.ts`. Convention de clé :
  `<surface>:<targetId>?:<ipHash>`. Ex : `view:42:<hash>`, `comment:<hash>`.
- **Transactions** : pour des mutations multi-tables (toggle like = insert + increment), utiliser
  `prisma.$transaction([...])`.
- **Revalidation** : après une mutation admin, appeler `revalidatePath(<route publique impactée>)` pour rafraîchir
  l'ISR.

## Codes HTTP

| Code | Quand                                                                 |
|------|-----------------------------------------------------------------------|
| 200  | Succès lecture / mise à jour                                          |
| 201  | Création réussie (POST)                                               |
| 400  | Body manquant / id invalide                                           |
| 401  | Pas de session admin                                                  |
| 403  | Action interdite (ex : `commentsDisabled`)                            |
| 404  | Ressource introuvable                                                 |
| 422  | Validation Zod KO                                                     |
| 429  | Rate-limit dépassé (renvoyer `code: "rateLimited"` pour i18n côté UI) |

## Réponses d'erreur i18n

Les messages d'erreur côté client sont traduits via les codes :

```ts
// API
return NextResponse.json({code: "rateLimited", message: "..."}, {status: 429});
```

```tsx
// Composant client
const json = await res.json();
if (json.code === "rateLimited") throw new Error(t("errors.rateLimited"));
```

Documenter les codes possibles côté front + back. Les codes vivent dans `src/lib/validations.ts` (
`<surface>ErrorCodes`).

## Pièges

- **`getAdminSession()` (`src/lib/auth.ts`) renvoie la session NextAuth ou `null`**. Ne pas s'en passer dans
  `/api/admin/**`.
- **Mutations sans `revalidatePath()`** : la page publique reste stale (ISR `revalidate = 60`). Toujours invalider après
  update/delete admin.
- **JSON nested non-typés** : si la route persiste un blob JSON (`Project.gallery`, `Project.techStack`), garder le type
  Prisma `Json` mais valider runtime côté lecture (`Array.isArray(...)`).
- **Routes longues** : par défaut Next coupe à 30s. Pour Resend/Nodemailer ou un envoi de mail synchrone, c'est OK. Si
  besoin > 30s, ajouter `export const maxDuration = N;`.
- **Honeypot** : pour les forms publics (contact, comments), retourner 200 silencieux quand le champ honeypot est
  rempli. Ne jamais 403 — le bot saurait qu'il a été détecté.
- **IPs en `x-forwarded-for`** : `getClientIp(req)` extrait le premier hop. Derrière nginx (configuration prod du repo),
  c'est la bonne IP client.
