# syntax=docker/dockerfile:1.7

# Build from monorepo root:
#   docker build -f apps/api/Dockerfile -t toonexpo-api .

FROM node:24-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.14.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @toonexpo/contracts build \
  && pnpm --filter @toonexpo/db build \
  && pnpm --filter @toonexpo/api build \
  && pnpm --filter @toonexpo/api --prod deploy --legacy /app/deploy

FROM node:24-bookworm-slim AS runner
ENV NODE_ENV=production
ENV PORT=4000
WORKDIR /app
RUN groupadd --system --gid 1001 nestjs \
  && useradd --system --uid 1001 --gid nestjs nestjs
COPY --from=build --chown=nestjs:nestjs /app/deploy ./
USER nestjs
EXPOSE 4000
CMD ["node", "dist/main.js"]
