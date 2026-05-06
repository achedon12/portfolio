# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Portfolio of Léo Deroin — Next.js 16 App Router · React 19 · TypeScript strict · Tailwind 4 · shadcn/ui · Prisma 6 + MySQL 9 · Three.js + R3F + drei · GSAP · Framer Motion · Lenis · next-intl · NextAuth v4 · MDX (next-mdx-remote + shiki).

Public site is bilingual (FR default, EN at `/en`). Admin (`/admin`) is FR-only and gated by NextAuth credentials.

## Where to look

Topic-scoped guidance lives under `.claude/rules/` (auto-loaded by Claude Code, some files have `paths:` frontmatter so they only attach when relevant):

| File                               | Always loaded | Topic                                                            |
|------------------------------------|---------------|------------------------------------------------------------------|
| `.claude/rules/commands.md`        | yes           | npm scripts, DB grant                                            |
| `.claude/rules/architecture.md`    | yes           | Multi-root layouts (no `app/layout.tsx`), `proxy.ts` middleware  |
| `.claude/rules/conventions.md`     | yes           | Theme, language, content rules                                   |
| `.claude/rules/operational.md`     | yes           | Real pitfalls (root-owned `.next/`, stale Prisma client, etc.)   |
| `.claude/rules/i18n.md`            | scoped        | Routing, navigation imports, message structure, validation codes |
| `.claude/rules/blog-engagement.md` | scoped        | Views / likes / comments, IP hashing                             |
| `.claude/rules/seo.md`             | scoped        | JSON-LD helpers, sitemap with hreflang, metadata convention      |
| `.claude/rules/env.md`             | scoped        | Env vars, production boot                                        |

`README.md` covers user-facing setup (clone → docker up → migrate → dev). This file is for the agent.
