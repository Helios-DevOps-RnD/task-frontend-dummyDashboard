# syntax=docker/dockerfile:1.7
# =============================================================================
#  hms-fe — Next.js 14.2 dashboard
#  Registry:  registry.hms.internal/hms/hms-fe:<git-sha>
#  Port:      3000
#
#  Build contract:
#    - `next.config.mjs` has `output: "standalone"` so `next build` emits
#      `.next/standalone/` (a minimal self-contained server).
#    - `entrypoint.sh` regenerates `/public/env-config.js` at container start
#      from env vars (API_URL, CREATE_URL) sourced via `envFrom` ConfigMap.
#      → ONE image works for staging & prod; we just patch the ConfigMap.
#    - Runs as a non-root user (uid/gid 1001).
#    - `tini` is PID 1 so SIGTERM from kubelet → graceful shutdown.
# =============================================================================

# ─── Stage 1: deps ───────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
# Copy only manifests to leverage layer caching
COPY package.json package-lock.json ./
# Include devDeps — Next.js build needs tailwind/postcss/eslint-config
RUN npm ci

# ─── Stage 2: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Stage 3: runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# tini = init for PID 1 signal handling
RUN apk add --no-cache tini

# Non-root user (match Next.js "nextjs" convention)
RUN addgroup -g 1001 -S nodejs \
 && adduser  -u 1001 -S nextjs -G nodejs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Standalone server bundle (server.js + minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Static assets (NOT included in standalone by design)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Public dir — includes env-config.js which entrypoint.sh rewrites at start
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Entrypoint that regenerates env-config.js from env vars
COPY --chown=nextjs:nodejs entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nextjs
EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--", "/entrypoint.sh"]
CMD ["node", "server.js"]
