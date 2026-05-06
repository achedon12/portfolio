# Architecture (big picture)

## Multi-root layouts (no `app/layout.tsx`)

**There is no top-level `src/app/layout.tsx`.** Two independent root layouts each render their own `<html>` and `<body>`:

- `src/app/[locale]/layout.tsx` — public root. Sets `<html lang={locale}>`, wraps in `NextIntlClientProvider`, runs `setRequestLocale`, mounts fonts + conditional Analytics + Matomo (production only via `NODE_ENV` check). Calls `notFound()` if locale ∉ `routing.locales`.
- `src/app/(admin)/layout.tsx` — admin root, `<html lang="fr">`, FR-only by design.

Top-level metadata files (`icon.tsx`, `apple-icon.tsx`, `opengraph-image.tsx`, `manifest.ts`, `robots.ts`, `sitemap.ts`, `blog/rss.xml/route.ts`, `api/**`) live outside both layouts and don't need an HTML wrapper.

## Middleware is `proxy.ts`

Next 16 + `src/` directory expects `src/proxy.ts` (NOT `middleware.ts` at root). The exported function is named `proxy`. It combines two middlewares:

- `/admin/*` (except `/admin/login`) → NextAuth `getToken` check, redirects to login on miss
- everything else → `createIntlMiddleware(routing)` for locale resolution

The matcher excludes `api`, `_next`, `_vercel`, files with extensions, and a few non-localizable static files (`opengraph-image`, `manifest.webmanifest`, `sitemap.xml`, `robots.txt`, `blog/rss.xml`).
