# syntax=docker/dockerfile:1.6

# ────────────────────────────────────────────────────────────
# 1. deps : installe toutes les deps (devDeps incluses pour le build)
# ────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci --no-audit --no-fund

# ────────────────────────────────────────────────────────────
# 2. builder : prisma generate + next build (sortie standalone)
#    Les NEXT_PUBLIC_* sont inlinés ici — il FAUT qu'ils soient
#    présents au moment du build, sinon les bundles JS sortent
#    avec des chaînes vides.
# ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

ENV NEXT_TELEMETRY_DISABLED=1

# Build args propagés en ENV pour que `npm run build` les voie.
ARG NEXT_PUBLIC_APP_URL=""
ARG NEXT_PUBLIC_MATOMO_URL=""
ARG NEXT_PUBLIC_MATOMO_SITE_ID=""
ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=""
ARG NEXT_PUBLIC_BING_SITE_VERIFICATION=""
# DATABASE_URL factice pour `prisma generate` — le client est généré sans se
# connecter, mais `prisma.config.ts` déclare la datasource via env() et exige
# que la variable existe. Au runtime, la vraie URL est injectée par compose.
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_MATOMO_URL=$NEXT_PUBLIC_MATOMO_URL \
    NEXT_PUBLIC_MATOMO_SITE_ID=$NEXT_PUBLIC_MATOMO_SITE_ID \
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=$NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION \
    NEXT_PUBLIC_BING_SITE_VERIFICATION=$NEXT_PUBLIC_BING_SITE_VERIFICATION \
    DATABASE_URL="mysql://build:build@localhost:3306/build"

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npx prisma generate && npm run build

# ────────────────────────────────────────────────────────────
# 3. runner : image finale minimale
#    On copie standalone + les deps strictement nécessaires au
#    boot (migrate deploy + seed + server.js).
# ────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN apk add --no-cache openssl tini wget && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Standalone bundle Next : server.js + node_modules tracés
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Schema + migrations + content (MDX seed)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/content ./content
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Standalone bundle de Next contient déjà ses deps tracées dans
# .next/standalone/node_modules/. Mais Prisma 6 CLI charge @prisma/config qui
# tire effect, c12, deepmerge-ts, empathic + transitives — trop fragile à
# cherry-picker. On écrase node_modules/ avec celui du builder pour avoir
# tout ce dont la CLI Prisma + le seed ont besoin au boot.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

COPY --chown=nextjs:nodejs .docker/app/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER nextjs

EXPOSE 3000

# Healthcheck simple : la racine doit répondre
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=10 \
  CMD wget -qO- http://localhost:3000/ > /dev/null 2>&1 || exit 1

ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/entrypoint.sh"]

CMD ["node", "server.js"]
