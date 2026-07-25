FROM oven/bun:1-alpine
WORKDIR /app

COPY package.json bun.lock* ./
COPY app/web/package.json ./app/web/
COPY packages/shared/package.json ./packages/shared/
RUN bun install

COPY app/web ./app/web
COPY packages/shared ./packages/shared

ENV NODE_ENV=development
EXPOSE 3000
CMD ["bun", "app/web/server/index.ts"]
