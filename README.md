## Adicionar novos componentes shadcn

O `components.json` já está configurado. Para adicionar outros componentes (dialog, table, select, etc.):

```bash
bunx shadcn@latest add dialog
```

## Build para produção

```bash
bun run build
NODE_ENV=production bun run start
```

## Cache com Redis

- `server/redis.ts` expõe um `RedisClient` nativo do Bun (`import { RedisClient } from "bun"`), sem depender de `ioredis` ou `node-redis`.
- `cached(key, fallback, ttlSeconds)` busca no Redis; se não existir, executa a consulta ao Postgres, grava no cache e define TTL.
- `invalidate(prefix)` remove todas as chaves de um prefixo (`users:`), usado após criar, atualizar ou remover um usuário.
- `GET /api/users` e `GET /api/users/:id` usam cache com TTL de 30s; escritas invalidam o cache.
- `GET /api/health` também reporta o status da conexão com o Redis.

## Notas
- As migrations e seeds usam TypeScript diretamente (`bunx knex ... --knexfile knexfile.ts`), sem precisar compilar antes.
