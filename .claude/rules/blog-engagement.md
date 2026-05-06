---
paths:
  - "src/app/api/blog/**"
  - "src/app/api/admin/blog/**"
  - "src/app/[locale]/(public)/blog/**"
  - "src/app/(admin)/admin/blog/**"
  - "src/components/blog/**"
  - "src/lib/blog.ts"
  - "src/lib/ip-hash.ts"
  - "src/lib/rate-limit.ts"
  - "prisma/schema.prisma"
  - "content/blog/**"
---

# Blog & engagement

## Blog data flow

Blog posts live in MySQL (`BlogPost` model). `prisma/seed.mjs` imports MDX files from `content/blog/*.mdx` into the DB on each seed (idempotent via `upsert`).

`src/lib/blog.ts` is the single entry point:

- `getAllPosts()` returns `PostMeta[]` filtered by `published=true AND publishedAt <= now()`.
- `getPostBySlug()` returns full `Post` with TOC extracted from MDX, computed `readingTime`, plus engagement counts (`viewCount`, `likeCount`, `commentsEnabled`).

## Engagement system (native, no external service)

- **Views**: `viewCount` on `BlogPost`, incremented by `POST /api/blog/[slug]/view`. Rate-limited 1/IP/post/24h via the existing `RateLimit` table (key `view:{postId}:{ipHash}`).
- **Likes**: `BlogPostLike` table with `@@unique([postId, ipHash])`. `POST /api/blog/[slug]/like` toggles in a transaction (insert/delete + atomic counter). `GET` returns the current IP's liked state for hydration.
- **Comments**: `BlogComment` table with `status: "pending" | "approved" | "spam"`. Public `POST /api/blog/[slug]/comments` writes as `pending`. Admin moderates at `/admin/blog/comments` (tabs by status, action set: approve / spam / pending / delete).

## IP hashing (RGPD)

All engagement endpoints hash IPs server-side via `src/lib/ip-hash.ts` (SHA-256 with `IP_HASH_PEPPER` env var). **The pepper must stay constant in production** — if it changes, all "already liked" / "already viewed" tracking breaks. Raw IPs are never persisted (only hashes).
