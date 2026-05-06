---
paths:
  - ".env*"
  - "docker-compose*.yml"
  - "Dockerfile"
  - ".docker/**"
  - "src/lib/matomo.ts"
  - "src/lib/auth.ts"
  - "src/lib/email.ts"
  - "src/lib/ip-hash.ts"
---

# Environment & deployment

`.env.example` is the source of truth. Non-obvious vars:

- `IP_HASH_PEPPER` — long random string (`openssl rand -base64 32`). Pepper for IP hashing (likes / views / comments dedup). Must stay stable in prod or all "already liked" / "already viewed" tracking breaks.
- `MATOMO_API_TOKEN` — server-only (no `NEXT_PUBLIC_` prefix). Used by `src/lib/matomo.ts` for the admin analytics dashboard.
- `NEXT_PUBLIC_MATOMO_URL` + `NEXT_PUBLIC_MATOMO_SITE_ID` — drive client tracking. `<Matomo />` script is only injected when `NODE_ENV === "production"`.
- `NEXTAUTH_SECRET` — required for the `getToken()` call in `proxy.ts`. Generate via `openssl rand -base64 32`.

## Production boot

`docker compose up` runs `.docker/app/entrypoint.sh` which executes `prisma migrate deploy` then `prisma db seed` before starting Next. Skip with `SKIP_DB_MIGRATE=1` or `SKIP_DB_SEED=1`. The seed is idempotent (admin upserted, projects/blog imported via `upsert` keyed by slug).
