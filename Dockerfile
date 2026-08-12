FROM oven/bun:1-alpine
WORKDIR /app

COPY package.json bun.lock* ./
COPY app/web/package.json ./app/web/
COPY app/mobile/package.json ./app/mobile/
COPY shared/package.json ./shared/
RUN bun install --frozen-lockfile

COPY app/web ./app/web
COPY shared ./shared

ENV NODE_ENV=development
EXPOSE 3000
USER bun
CMD ["bun", "--hot", "app/web/server/server.ts"]
