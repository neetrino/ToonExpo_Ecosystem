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
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app

# Stage 1 — minimal monorepo slice for @toonexpo/api
FROM base AS prune
ARG API_PACKAGE
COPY . .
RUN pnpm dlx turbo@${TURBO_VERSION} prune ${API_PACKAGE} --docker

# Stage 2 — install deps and build api + workspace packages
FROM base AS build
ARG API_PACKAGE
COPY --from=prune /app/out/json/ .
COPY --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=prune /app/out/full/ .
RUN pnpm --filter @toonexpo/db exec prisma generate \
  && pnpm turbo run build --filter=${API_PACKAGE}
RUN pnpm --filter ${API_PACKAGE} --prod deploy --legacy /app/deploy

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
