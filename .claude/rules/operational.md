# Operational pitfalls (real ones, observed in this repo)

- **`.next/` and parts of `node_modules/` may end up root-owned** after a Docker build/run. Symptoms: `EACCES` on `.next/trace`, `EACCES` on `npm install`. Fix: `sudo rm -rf .next` (and clean specific node_modules subdirs) before re-running. `npm install` may fail to add new packages until cleaned — prefer dependency-free implementations when possible.

- **Prisma client is cached in the running dev process.** After a migration that adds columns, fields can come back `undefined` until dev is restarted. Defensive `?? defaultValue` in lib accessors and components is a safety net but not a substitute for restarting.

- **`prisma migrate dev` is interactive** when dropping or renaming columns with data. For non-interactive flows: hand-write the migration SQL under `prisma/migrations/<ts>_<name>/migration.sql`, then run `npx prisma migrate deploy` + `npx prisma generate`.

- **Framer Motion `whileInView` overrides `style.opacity`** after the entry animation completes. To dim children based on filter state, wrap them in a non-motion `<g opacity={x}>` inside the `motion.g`.

- **`npm run lint` is broken** with `eslint-config-next` v16 + Next 16 (`Invalid project directory provided, no such directory: …/lint`). Use `npx eslint src` directly. Flat config is at `eslint.config.mjs`.

- **`react/no-unescaped-entities`** is disabled project-wide because of constant FR apostrophes (`l'utilisateur`, `j'ai`).

- **Static-rendering caveats**: pages under `[locale]/` need `setRequestLocale(locale)` before any `getTranslations()` call to participate in SSG. Forgetting this forces dynamic rendering.
