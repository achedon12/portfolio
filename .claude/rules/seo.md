---
paths:
  - "src/lib/seo.ts"
  - "src/app/sitemap.ts"
  - "src/app/robots.ts"
  - "src/app/manifest.ts"
  - "src/app/icon.tsx"
  - "src/app/apple-icon.tsx"
  - "src/app/opengraph-image.tsx"
  - "src/app/blog/rss.xml/**"
  - "src/app/[locale]/**/page.tsx"
  - "src/app/[locale]/layout.tsx"
---

# SEO

## JSON-LD helpers

`src/lib/seo.ts` exposes structured-data helpers:

- `personJsonLd`, `websiteJsonLd`, `professionalServiceJsonLd` (used on the home page)
- `projectJsonLd` (project detail)
- `breadcrumbJsonLd` (every nested public page)
- `blogIndexJsonLd` (blog index, plus inline `BlogPosting` on the article page)

Each public page injects relevant schemas as `<script type="application/ld+json">`.

## Sitemap with hreflang

`src/app/sitemap.ts` emits one entry per (path, locale) combination, each with full `alternates.languages` (fr / en / x-default) — Next inlines these as `<xhtml:link rel="alternate" hreflang>` in the XML.

When adding a new public route, append a call to the local `entry()` helper inside `sitemap.ts` so both locales get listed.

## Per-page metadata convention

`generateMetadata` on every `[locale]/(public)/**/page.tsx` sets:

- `alternates.canonical` — locale-aware (`/foo` for FR, `/en/foo` for EN)
- `alternates.languages` — `{ fr, en, "x-default" }`
- `openGraph.locale` — `"fr_FR"` or `"en_US"`
- targeted Lyon-area keywords merged with per-page terms

## RSS

`src/app/blog/rss.xml/route.ts` is a route handler (not localized). Includes `<atom:link rel="self">`, `<lastBuildDate>`, escaped XML entities. Linked from the blog index page.
