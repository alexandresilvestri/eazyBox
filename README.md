# Projeto Full Stack — Bun + TypeScript + Tailwind + shadcn/ui + PostgreSQL + Knex

Stack:

- **Runtime/servidor**: Bun (`Bun.serve` com roteamento nativo e import direto de HTML, que o Bun bundla automaticamente — sem Vite/Webpack)
- **Frontend**: React + TypeScript + Tailwind CSS + componentes no padrão shadcn/ui
- **Backend**: API REST servida pelo próprio Bun, sem framework HTTP adicional
- **Banco de dados**: PostgreSQL
- **Query builder / migrations**: Knex.js
- **Cache**: Redis, via cliente nativo do Bun (`RedisClient` de `"bun"`, sem ioredis)

## Estrutura

```
projeto-fullstack/
├── server/
│   ├── index.ts          # Bun.serve: rotas de API + entrada do frontend
│   ├── db.ts              # instância do Knex
│   ├── redis.ts            # cliente Redis nativo do Bun + helpers de cache
│   ├── routes/users.ts    # handlers da API de usuários (com cache)
│   ├── migrations/        # migrations do Knex
│   └── seeds/             # seeds do Knex
├── src/
│   ├── index.html          # ponto de entrada (Bun bundla CSS/TSX referenciados)
│   ├── index.tsx           # bootstrap do React
│   ├── App.tsx              # tela de exemplo (CRUD de usuários)
│   ├── index.css            # Tailwind + variáveis de tema (shadcn)
│   ├── lib/utils.ts         # helper cn()
│   └── components/ui/       # componentes shadcn (button, card, input, label)
├── knexfile.ts
├── docker-compose.yml       # sobe um Postgres local
├── components.json          # config do shadcn CLI (bunx shadcn add ...)
└── .env.example
```

## Pré-requisitos

- [Bun](https://bun.sh) instalado (`curl -fsSL https://bun.sh/install | bash`)
- Docker (opcional, para subir Postgres e Redis locais) ou instâncias já disponíveis

## Como rodar

1. Instalar dependências:

   ```bash
   bun install
   ```

2. Copiar variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```

3. Subir o Postgres e o Redis (ou apontar `.env` para instâncias existentes):

   ```bash
   docker compose up -d
   ```

4. Rodar as migrations e (opcionalmente) os seeds:

   ```bash
   bun run migrate
   bun run seed
   ```

5. Subir o servidor em modo desenvolvimento (hot reload no front e no back):

   ```bash
   bun run dev
   ```

   Acesse `http://localhost:3000`.

## Adicionar novos componentes shadcn

O `components.json` já está configurado. Para adicionar outros componentes (dialog, table, select, etc.):

```bash
bunx shadcn@latest add dialog
```

## API

| Método | Rota              | Descrição              |
|--------|-------------------|-------------------------|
| GET    | `/api/users`      | Lista usuários          |
| GET    | `/api/users/:id`  | Busca usuário por id    |
| POST   | `/api/users`      | Cria usuário             |
| PUT    | `/api/users/:id`  | Atualiza usuário         |
| DELETE | `/api/users/:id`  | Remove usuário           |
| GET    | `/api/health`     | Healthcheck              |

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

- Não há Vite/Webpack/esbuild manual: o próprio `Bun.serve` importa `src/index.html` e bundla o TSX/CSS referenciado nele, com HMR incluso em desenvolvimento.
- As migrations e seeds usam TypeScript diretamente (`bunx knex ... --knexfile knexfile.ts`), sem precisar compilar antes.
