# eazybox

Gestão de box de CrossFit: um painel web para a equipe e um app para o aluno, sobre a mesma API.

## O que faz

**Aluno (app Expo)** — vê o WOD do dia (aquecimento, skill e WOD), a agenda da semana, faz check-in na aula dentro da janela que abre 12 horas antes do horário, acompanha o histórico de presenças, lê os avisos do box e edita o perfil.

**Equipe (painel web)** — Dashboard, Aulas, Horários, WODs, Check-ins, Clientes, Coaches e Ajustes: monta a grade semanal com capacidade e coach por horário, acompanha a ocupação de cada sessão, vê a lista de presentes, confirma o check-in do aluno que esqueceu e acompanha os relatórios.

**Papéis** — admin, coach e aluno. As seções restritas a admin somem da navegação do coach, e o Postgres reforça a mesma regra por Row Level Security.

## Stack

Monorepo Bun com três workspaces:

- `app/web` — API Hono + painel React 19 / react-router 7 / Tailwind v4, empacotado pelo próprio Bun (sem Vite, sem webpack)
- `app/mobile` — app do aluno em Expo SDK 57 com Expo Router
- `shared` — `@eazybox/shared`, tipos e schemas Zod usados pelos dois clientes

Persistência em Postgres 18 com Knex, cache em Redis. Autenticação JWT: cookie `httpOnly` no painel, bearer token no app.

## Requisitos

- Bun 1.3.14 (ver `.tool-versions`)
- Docker, para o Postgres e o Redis
- Node, usado pelo Expo CLI e pelas migrations

## Começando

```bash
cp .env.example .env   # preencha JWT_SECRET, ADMIN_EMAIL e ADMIN_PASSWORD
make up                # Postgres + Redis
make install
make migrate
make admin             # cria o primeiro admin a partir do .env
make dev               # API + painel em http://localhost:3000
make mobile            # app do aluno (Expo)
```

`make seed` limpa o banco de desenvolvimento e preenche com dados fictícios. Para rodar o app em um celular, `EXPO_PUBLIC_API_URL` (em `app/mobile/.env`) precisa apontar para o IP da máquina na rede local, não para `localhost`.

## Comandos

| Comando | O que faz |
| --- | --- |
| `make up` / `make down` | Sobe e derruba Postgres + Redis |
| `make dev` | API e painel com hot reload |
| `make mobile` | Servidor de desenvolvimento do Expo |
| `make test` | Suíte de testes (`bun test`) |
| `make verify` | Typecheck, lint e testes |
| `make migrate` | Aplica as migrations |
| `make migrate-create <nome>` | Cria uma migration |
| `make seed` | Recria o banco de desenvolvimento com dados fictícios |
| `make admin` | Cria o primeiro admin |
| `make pgcli` | Abre uma sessão psql |

## Estrutura

```
app/web/server     API Hono: routes, controllers, services, models, migrations
app/web/client     painel da equipe: pages, components, tokens.css
app/mobile/src     app do aluno: app (rotas), components, lib, constants
shared/core        tipos, schemas Zod e as regras de sessão compartilhadas
```

## Deploy

Build por `Dockerfile`; `railway.json` roda as migrations no pre-deploy e usa `/api/health` como healthcheck.

Detalhes de arquitetura — camadas do servidor, RLS, cache e os dois transportes de autenticação — estão em `CLAUDE.md`.
