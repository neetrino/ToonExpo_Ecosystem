# syntax=docker/dockerfile:1.7
#
# Build from monorepo root:
#   docker build -f apps/api/Dockerfile -t toonexpo-api .
#
# Cloud Run injects PORT at runtime (default 8080). Do not bake secrets into the image.

ARG NODE_VERSION=24-bookworm-slim
ARG PNPM_VERSION=11.14.0
ARG TURBO_VERSION=2.10.5
ARG API_PACKAGE=@toonexpo/api

FROM node:${NODE_VERSION} AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app

# Stage 1 — minimal monorepo slice for @toonexpo/api
FROM base AS prune
ARG API_PACKAGE
COPY . .
RUN pnpm dlx turbo@${TURBO_VERSION} prune ${API_PACKAGE} --docker

# Stage 2 — install deps and build api + workspace packages
# Layer order: lockfile + package.json install first so Cloud Build --cache-from
# can reuse node_modules when only application source changes.
FROM base AS build
ARG API_PACKAGE
COPY --from=prune /app/out/json/ .
COPY --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY --from=prune /app/out/full/ .
# Turbo and prisma.config.ts load DATABASE_URL from the monorepo root .env at build time (no DB connection).
# Second install re-links workspace packages after full sources are present; usually fast when lockfile is unchanged.
RUN printf 'DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build\n' > .env \
  && pnpm install --frozen-lockfile \
  && pnpm --filter @toonexpo/db exec prisma generate \
  && pnpm turbo run build --filter=${API_PACKAGE} \
  && pnpm --filter ${API_PACKAGE} --prod deploy --legacy /app/deploy --config.ignore-scripts=true

# Stage 3 — slim runtime (Debian slim: Prisma 7 library engine + argon2 native bindings)
FROM node:${NODE_VERSION} AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN groupadd --system --gid 1001 nestjs \
  && useradd --system --uid 1001 --gid nestjs nestjs
COPY --from=build --chown=nestjs:nestjs /app/deploy ./
USER nestjs
EXPOSE 8080
CMD ["node", "dist/main.js"]
