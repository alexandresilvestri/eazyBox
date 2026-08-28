FROM oven/bun:1-alpine AS base
WORKDIR /app

COPY package.json bun.lock* ./
COPY app/web/package.json ./app/web/
COPY app/mobile/package.json ./app/mobile/
COPY shared/package.json ./shared/

FROM base AS dev
RUN bun install --frozen-lockfile
COPY shared ./shared
COPY app/web ./app/web
WORKDIR /app/app/web
ENV NODE_ENV=development
EXPOSE 3000
USER bun
CMD ["bun", "--hot", "server/server.ts"]

FROM base AS prod
RUN bun install --frozen-lockfile --production --omit=peer \
    --filter='@eazybox/web' --filter='@eazybox/shared'
COPY shared ./shared
COPY app/web ./app/web
WORKDIR /app/app/web
ENV NODE_ENV=production
EXPOSE 3000
USER bun
CMD ["bun", "server/server.ts"]
