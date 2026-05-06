#!/bin/sh
set -e

# Apply pending Prisma migrations from prisma/migrations/.
# To skip (ex: rollback debug), run with SKIP_DB_MIGRATE=1.
if [ "${SKIP_DB_MIGRATE:-0}" != "1" ]; then
  echo "[entrypoint] Applying Prisma migrations (migrate deploy)…"
  node node_modules/prisma/build/index.js migrate deploy
fi

# Idempotent seed: creates the default admin on first boot, no-op afterwards.
# Set SKIP_DB_SEED=1 to skip.
if [ "${SKIP_DB_SEED:-0}" != "1" ]; then
  echo "[entrypoint] Running Prisma seed (admin bootstrap)…"
  node node_modules/prisma/build/index.js db seed
fi

exec "$@"
