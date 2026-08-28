# eazybox

Bun monorepo, API only. Workspaces: `app/web` (Hono API), `shared` (`@eazybox/shared`, types and Zod schemas).

Bun only — no Node, no Vite, no webpack, no browser bundle. The server serves JSON under `/api` and nothing else; any other path gets Hono's 404.

## Commands

From the repo root:

| Command | Purpose |
| --- | --- |
| `make up` / `make down` | Postgres + Redis via docker compose |
| `make install` | `bun install --frozen-lockfile` |
| `make dev` | API with hot reload (`bun --hot server/server.ts`) |
| `make typecheck` | `tsc --noEmit` across all workspaces |
| `make lint` / `make lint-fix` | ESLint over `app/web` |
| `make format` / `make format-check` | Prettier over `app/web` |
| `make verify` | The full gate: typecheck, then lint, then the Bun suite |
| `make migrate` | Apply Knex migrations |
| `make migrate-create <name>` | Scaffold a migration |
| `make test` / `make test-watch` | Run the Bun test suite |
| `make pgcli` | Open a psql session |
| `make admin` | Bootstrap the first admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` |
| `make seed` | Wipe the dev database and refill it with fictional data |

`bun run --filter` runs each script with cwd set to the workspace, and Bun only auto-loads `.env` from cwd — the root `.env` is invisible there. Makefile targets that need it (`dev`, `migrate*`, `admin`) source it through `$(LOAD_ENV)`. Test targets deliberately do not: `server/tests/helpers/env.ts` owns the test defaults, and exporting the dev `DATABASE_URL` into `bun test` points the suite at the dev database as owner, which makes RLS inert.

Every target is a thin delegation to a workspace script, so the underlying commands still work directly — from `app/web`: `bun run lint`, `bun run lint:fix`, `bun run format`, `bun run typecheck`.

Tests are `bun test`. There is no second runner. `app/web/bunfig.toml` preloads `server/tests/setup.ts`, which creates `eazybox_test`, migrates it, and truncates between tests. The suite shares one database, so it **must** run serially — `bun run test` passes `--parallel=1`. Bare `bun test` runs files in parallel workers and they will wipe each other's fixtures.

`bunfig.toml` sets `[test] root = "./server"`. Every test currently lives under `server/tests/`, so it changes nothing today — it is there so a stray spec added elsewhere in the workspace never joins the suite silently. `preload` resolves relative to `bunfig.toml`, not to `root`.

`bun run --filter @eazybox/web admin:create` bootstraps the first admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

**Finish every server change with `bun run typecheck && bun run lint && bun run test` from `app/web`.**

---

# Server architecture — app/web

Applies to `app/web/server/**`.

Each layer imports only the layer directly below it, through that layer's `index.ts`.

```
server.ts             serve() only; ./sentry imported first so init runs
                      before anything it instruments loads
  └─> app.ts          the Hono instance (importable by tests)
       └─> routes/         Hono wiring, export default
            └─> controllers/    functions, HTTP boundary
                 └─> services/       classes, business rules
                      └─> models/         classes, data access
                           └─> db/db.ts        Knex pool as app_user

cross-cutting: middlewares/, errors/, context.ts, @eazybox/shared, redis.ts
```

`server.ts` must stay import-safe to split from `app.ts`: importing `app.ts` never opens a socket, which is what lets tests call `app.request('/api/...')` with no port.

## Forbidden imports

- `routes/` → no `services/`, `models/`, `db`
- `controllers/` → no `models/`, no `db`
- `services/` → no `hono`, never reference `Context`
- `models/` → no `redis` (caching is a service concern)
- Only `models/index.ts` may import `db` from `db/db.ts`
- Never reach past a sibling barrel: `'../services'`, never `'../services/users'`

## `models/` — classes, data access

One class per table, constructor takes `Knex`. Owns query building and the public-column projection. The only place Knex is touched. Returns plain data; does not throw domain errors — let driver errors propagate.

`db/knex.config.ts` maps camelCase ↔ snake_case, so models always speak camelCase.

```ts
import type { Knex } from 'knex'
import type { User } from '@eazybox/shared'

export class UserModel {
  constructor(private readonly db: Knex) {}

  findById(id: string) {
    return this.db<User>('users').select().where({ id }).first()
  }
}
```

## `services/` — classes, business rules

Constructor takes model instances. Owns Redis caching via `cached` / `invalidate` from `server/redis.ts`, cache keys, password hashing, and translation of driver errors into `errors/` classes. No `Context`, no status codes, no response shaping.

```ts
import { cached, invalidate } from '../redis'
import { EmailAlreadyTaken } from '../errors'
import type { UserModel } from '../models/user'

const CACHE_PREFIX = 'users:'
const LIST_TTL_SECONDS = 30
const UNIQUE_VIOLATION = '23505'

export class UsersService {
  constructor(private readonly users: UserModel) {}

  list() {
    return cached(
      `${CACHE_PREFIX}list`,
      () => this.users.findAll(),
      LIST_TTL_SECONDS
    )
  }

  async create(input: CreateUserInput) {
    try {
      const user = await this.users.insert({
        ...input,
        password: await Bun.password.hash(input.password),
      })
      await invalidate(CACHE_PREFIX)
      return user
    } catch (err) {
      if ((err as { code?: string } | null)?.code === UNIQUE_VIOLATION) {
        throw new EmailAlreadyTaken()
      }
      throw err
    }
  }
}
```

## `controllers/` — functions, HTTP boundary

One exported `async (c: Context) => Response` per operation: read params and body, `safeParse` the shared Zod schema, call the service, map result or domain error to status + JSON. Owns every user-facing message. Rethrow unexpected errors so `app.onError` reports to Sentry.

Conventions: errors under `error`, Zod issues under `issues`, `204` uses `c.body(null, 204)`.

```ts
import type { Context } from 'hono'
import { createUserSchema } from '@eazybox/shared'
import { usersService } from '../services'
import { EmailAlreadyTaken } from '../errors'

export const create = async (c: Context) => {
  const parsed = createUserSchema.safeParse(
    await c.req.json().catch(() => null)
  )
  if (!parsed.success) {
    return c.json(
      { error: 'Dados inválidos', issues: parsed.error.issues },
      400
    )
  }

  try {
    return c.json(await usersService.create(parsed.data), 201)
  } catch (err) {
    if (err instanceof EmailAlreadyTaken) {
      return c.json({ error: 'Já existe um usuário com esse e-mail' }, 409)
    }
    throw err
  }
}
```

## `routes/` — wiring only

Create the `Hono` instance, bind verb + path + middleware + controller reference. No handler bodies — an arrow function with a body in a route file belongs in a controller.

```ts
export const usersRoutes = new Hono()

usersRoutes.get('/:id', usersController.findById)
usersRoutes.post('/', usersController.create)
```

## `errors/` and `middlewares/`

`errors/`: classes extending `Error` with a `name`, no HTTP status. Thrown by services, caught by controllers.

`middlewares/`: `auth.ts` (`authenticate`, `requireAdmin`, `requireStaff`), `rls.ts` (`withRlsContext`), `transport.ts` (`withTransport`), `errorHandler.ts`. A middleware is a function returning a `MiddlewareHandler`, attached in `routes/`, never in a controller.

`jwt.ts` at the server root is the single owner of the access-token shape — `signAccessToken` / `verifyAccessToken`, the cookie names, and the TTLs. `services/auth.ts` signs, `middlewares/auth.ts` verifies, tests sign. Do not re-read `JWT_SECRET` anywhere else.

Validation is `safeParse` on the shared schema inside the controller, with the message from `controllers/messages.ts`. `@hono/zod-validator` is a dependency and currently unused — moving the parse into a `validations.ts` middleware would delete ~45 duplicated lines and is a sanctioned simplification, not a rewrite.

---

# Barrel files (`index.ts`)

One `index.ts` per folder under `server/` — the folder's only public surface. Barrels contain re-exports and the singleton construction below. No logic, no conditionals.

`models/index.ts` and `services/index.ts` are the entire DI wiring. They export **factories, not singletons**, because RLS identity is transaction-scoped and a process-wide pool cannot carry it:

```ts
// server/models/index.ts
export const transaction = <T>(work: (trx: Knex.Transaction) => Promise<T>) =>
  db.transaction(work)

export const buildModels = (trx: Knex.Transaction) => ({
  users: new UserModel(trx),
})
export type Models = ReturnType<typeof buildModels>
```

```ts
// server/services/index.ts
export const buildServices = (models: Models) => ({
  users: new UsersService(models.users),
})
export type Services = ReturnType<typeof buildServices>
```

`withRlsContext()` builds one container per request and puts it on the context, so controllers read `c.get('services').users` instead of importing a singleton. `authService` is the one exception — it runs on the base pool because login precedes identity.

`controllers/index.ts` namespace-exports (`export * as usersController from './users'`) so routes read as `usersController.list`.

`routes/index.ts` composes and default-exports the router, and owns `/health` (which reports `redisReachable()`).

`errors/index.ts` and `middlewares/index.ts` are plain `export * from './x'`.

---

# Auth and RLS

Authorization is enforced twice: `requireAdmin()` / `requireStaff()` in `routes/` as the readable first line, and Postgres RLS as the backstop for any route someone forgets to guard.

- The runtime connects as **`app_user`** (`DATABASE_URL`), a non-superuser that RLS applies to. Migrations and scripts connect as the owner (`DATABASE_OWNER_URL`) and bypass policies — that is deliberate and is why `make migrate` works.
- `authenticate()` verifies the JWT (from the `session` cookie on the cookie mount, from `Authorization: Bearer` on the bearer mount), then `withRlsContext()` opens a transaction and sets `app.user_id` / `app.is_admin` / `app.is_coach` via `set_config(..., true)`. Both are applied once, by the `guarded` sub-app in `routes/index.ts` — registering them per path runs them twice, opens two nested transactions, and wedges the connection pool at `pool.max` concurrent requests.
- **Transport is chosen by the route, never by a request header.** `/api/auth/*` is the cookie mount, `/api/mobile/auth/*` the bearer mount, each fixed by `withTransport()` at wiring time. `Transport` in `context.ts` is `'cookie' | 'token'` — named by mechanism, not by client. The `/mobile` path segment is a legacy name kept for already-shipped native clients; any bearer client uses it. Sniffing something like `X-Client` would let an XSS payload ask for the refresh token in a JSON body and defeat `httpOnly`.
- A member reading someone else's row gets **404, not 403** — RLS makes the row invisible before authorization can speak. Do not "fix" this to 403; it would leak existence.
- **Never put `deleted_at is null` in a SELECT policy.** Postgres applies SELECT policies to the *new* row of an UPDATE, so a soft delete would make the row invisible to the statement writing it and fail. Soft-delete filtering lives in `models/`.
- **Privilege is server-asserted, by decision.** `app.is_admin` / `app.is_coach` are set by `withRlsContext()` from verified JWT claims, so RLS enforces *identity* independently but takes *privilege* on trust. This is deliberate — deriving the flags from `users` in a `SECURITY DEFINER` helper was considered and declined. Do not "fix" it without revisiting the tradeoff below.
  - It **does** cover a route that forgets `requireAdmin()`: the GUC reflects the real token, so a member stays a member. `rls/policies.test.ts` proves this at the SQL layer — a member identity inserting a workout is rejected by the policy, with no HTTP guard involved.
  - It does **not** cover anyone holding an `app_user` session or achieving SQL injection — `set app.is_admin='true'` escalates. Treat `DATABASE_URL` credentials as privileged.
  - Accepted consequence: demoting a user leaves their access token privileged until it expires (15 min). Refresh picks up the new flags via `app.find_identity`; `integration/auth.test.ts` asserts this.
- **If `DATABASE_URL` points at the owner instead of `app_user`, RLS is silently inert** — every policy still exists and nothing errors. Check with `select current_user` before trusting a manual RLS test.
- Pre-identity reads go through `SECURITY DEFINER` functions (`app.find_login`, `app.find_identity`). These are the only paths that bypass policies; do not add more without a reason.
- `cached()` may only wrap identity-invariant reads (`workouts`, `workout_schedule`, `workout_sessions`). Anything RLS filters per user must skip the cache or one member's rows will be served to another.
- Cache prefixes live in `services/constants.ts` as `CACHE_PREFIX` / `CACHE_PREFIXES`. A new cached resource must add its prefix there, because `server/tests/setup.ts` clears that same list between tests — truncating tables bypasses the service layer, so nothing else invalidates Redis.

# Migrations run on Node, not Bun

`bunx knex` shells out to Node, so **`Bun.*` APIs are unavailable inside migrations**. Anything needing `Bun.password` belongs in `server/scripts/` and runs with `bun`.

# Shared package

`@eazybox/shared` owns types (`shared/core/types`) and Zod schemas (`shared/core/schemas`).

- Import from the package root: `import { createUserSchema, type User } from '@eazybox/shared'`. Never a deep path.
- Do not redeclare in `server/models/` a type shared already exports.
- Server-only shapes that must not reach a client (the `users` row including `password`) live in the model file, not in shared.

Gotcha: `updateUserSchema` is `z.object({})`, so `PATCH /api/users/:id` strips every field. Define its fields before relying on that endpoint.

---

# Style

- Prettier (`app/web`): no semicolons, single quotes, 2-space indent, `trailingComma: es5`.
- Inline type imports: `import { hash, type User } from '...'`.
- Relative imports are extensionless (`moduleResolution: "bundler"`).
- No comments. Extract a named function or constant instead of explaining a block.
- English identifiers, Portuguese user-facing API messages.
- `window`, `document`, `localStorage` are ESLint errors under `server/**`.

---

# Adding a resource

Using `posts` as the example, in order:

1. `shared/core/types/index.ts` — `Post` type; `shared/core/schemas/posts.ts` — schemas, re-exported from `schemas/index.ts`
2. `make migrate-create add_posts`, then fill the migration
3. `server/models/post.ts` — `class PostModel` taking `Knex`
4. `server/models/index.ts` — add `posts: new PostModel(trx)` inside `buildModels`. Never `new PostModel(db)` — a pool-bound model carries no RLS identity.
5. `server/services/posts.ts` — `class PostsService` taking `PostModel`
6. `server/services/index.ts` — add `posts: new PostsService(models.posts)` inside `buildServices`
7. `server/controllers/posts.ts` — one exported function per operation, reading `c.get('services').posts`
8. `server/controllers/index.ts` — `export * as postsController from './posts'`
9. `server/routes/posts.ts` — `export const postsRoutes`, with `requireAdmin()` / `requireStaff()` on the write verbs
10. `server/routes/index.ts` — add `['/posts', postsRoutes]` to the **`PROTECTED` array**. Do not call `routes.route()` directly: only the array is mounted inside the `guarded` sub-app that applies `authenticate()` + `withRlsContext()`, so a direct registration ships an unauthenticated endpoint with no `services` on the context. `integration/routing.test.ts` asserts every entry rejects an untokened request.
11. If the resource is cached, add its prefix to `CACHE_PREFIX` in `services/constants.ts`
12. `bun run typecheck && bun run lint && bun run test`
