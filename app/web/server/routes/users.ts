import { Hono } from 'hono'
import { createUserSchema, updateUserSchema, type User } from '@eazybox/shared'
import { db } from '../db/db'
import { cached, invalidate } from '../redis'

const CACHE_PREFIX = 'users:'
const LIST_CACHE_KEY = `${CACHE_PREFIX}list`
const LIST_TTL_SECONDS = 30
const UNIQUE_VIOLATION = '23505'

const PUBLIC_COLUMNS: (keyof User)[] = [
  'id',
  'email',
  'firstName',
  'lastName',
  'createdAt',
  'updatedAt',
]

function isUniqueViolation(err: unknown): boolean {
  return (err as { code?: string } | null)?.code === UNIQUE_VIOLATION
}

export const usersRoutes = new Hono()

usersRoutes.get('/', async (c) => {
  const users = await cached(
    LIST_CACHE_KEY,
    () => db<User>('users').select(PUBLIC_COLUMNS).orderBy('createdAt', 'asc'),
    LIST_TTL_SECONDS
  )
  return c.json(users)
})

usersRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  const user = await cached(
    `${CACHE_PREFIX}${id}`,
    () => db<User>('users').select(PUBLIC_COLUMNS).where({ id }).first(),
    LIST_TTL_SECONDS
  )
  if (!user) return c.json({ error: 'Usuário não encontrado' }, 404)
  return c.json(user)
})

usersRoutes.post('/', async (c) => {
  const parsed = createUserSchema.safeParse(
    await c.req.json().catch(() => null)
  )
  if (!parsed.success) {
    return c.json(
      { error: 'Dados inválidos', issues: parsed.error.issues },
      400
    )
  }

  const { password, ...profile } = parsed.data
  try {
    const [user] = await db('users')
      .insert({ ...profile, password: await Bun.password.hash(password) })
      .returning(PUBLIC_COLUMNS)
    await invalidate(CACHE_PREFIX)
    return c.json(user, 201)
  } catch (err) {
    if (isUniqueViolation(err)) {
      return c.json({ error: 'Já existe um usuário com esse e-mail' }, 409)
    }
    throw err
  }
})

usersRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const parsed = updateUserSchema.safeParse(
    await c.req.json().catch(() => null)
  )
  if (!parsed.success) {
    return c.json(
      { error: 'Dados inválidos', issues: parsed.error.issues },
      400
    )
  }

  const [user] = await db('users')
    .where({ id })
    .update({ ...parsed.data, updatedAt: db.fn.now() })
    .returning(PUBLIC_COLUMNS)

  if (!user) return c.json({ error: 'Usuário não encontrado' }, 404)
  await invalidate(CACHE_PREFIX)
  return c.json(user)
})

usersRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const deleted = await db('users').where({ id }).del()
  if (!deleted) return c.json({ error: 'Usuário não encontrado' }, 404)
  await invalidate(CACHE_PREFIX)
  return c.body(null, 204)
})
