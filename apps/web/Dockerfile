# syntax=docker/dockerfile:1.7
#
# Build from the monorepo root (not apps/web):
#   docker build -f apps/web/Dockerfile -t toonexpo-web \
#     --build-arg API_PROXY_TARGET=https://toonexpo-api.neetrino.com \
#     --build-arg APP_URL=https://toonexpo.neetrino.com \
#     .
#
# `output: "standalone"` is intentionally off. The container runs the existing
# `start` script (`next start -H 0.0.0.0 -p 3000`). Standalone tracing is unsafe
# here: Node 24 loads next.config.ts at startup, and that file imports dotenv
# plus TypeScript source. Vercel ignores standalone and keeps using vercel.json.

ARG NODE_VERSION=24-bookworm-slim

FROM node:${NODE_VERSION} AS base
ARG PNPM_VERSION=11.14.0
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    HUSKY=0 \
    NEXT_TELEMETRY_DISABLED=1 \
    TURBO_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app

# Stage 1 — workspace slice for @toonexpo/web (not api/db).
FROM base AS prune
ARG TURBO_VERSION=2.10.5
COPY . .
RUN pnpm dlx turbo@${TURBO_VERSION} prune @toonexpo/web --docker

# Stage 2 — install the pruned graph and run the existing web build.
FROM base AS build
ENV CI=true
COPY --from=prune /app/out/json/ .
COPY --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=prune /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile
COPY --from=prune /app/out/full/ .

# Coolify "Available at Buildtime" arrives as --build-arg.
# ARG is visible to this RUN and is not copied into the runtime image env.
# Next still inlines NEXT_PUBLIC_* and bakes rewrites into .next.
ARG API_PROXY_TARGET
ARG R2_PUBLIC_URL
ARG NEXT_PUBLIC_R2_PUBLIC_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SENTRY_DSN
ARG APP_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_MAP_STYLE_URL
RUN if [ -z "${API_PROXY_TARGET}" ] && [ -z "${NEXT_PUBLIC_API_URL}" ]; then \
      printf '%s\n' "Build requires API_PROXY_TARGET (proxy mode) or NEXT_PUBLIC_API_URL (direct mode)." >&2; \
      exit 1; \
    fi; \
    pnpm turbo run build --filter=@toonexpo/web

# Stage 3 — production runner. Keeps the pruned install because `next start`
# loads next.config.ts, which imports the dotenv devDependency.
# `pnpm` on PATH is a Corepack shim. Seed the non-root home from the image
# cache so startup does not download pnpm or write into root-owned `/app`.
FROM base AS runner
ENV NODE_ENV=production \
    HOME=/home/nextjs \
    pnpm_config_verify_deps_before_run=false
WORKDIR /app
# Coolify health checks curl from inside the container. The base stage does not install it.
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN groupadd --system --gid 1001 nodejs \
  && useradd --uid 1001 --gid nodejs --home-dir /home/nextjs --create-home --shell /usr/sbin/nologin nextjs \
  && cp -a /root/.cache /home/nextjs/.cache \
  && chown -R nextjs:nodejs /home/nextjs
COPY --from=build --chown=nextjs:nodejs /app ./
RUN rm -rf apps/web/.next/cache apps/web/e2e .turbo \
  && chown nextjs:nodejs /app
USER nextjs
EXPOSE 3000
CMD ["pnpm", "--filter", "@toonexpo/web", "start"]
