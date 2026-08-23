import type { Context } from 'hono'
import { createUserSchema, updateUserSchema } from '@eazybox/shared'
import { EmailAlreadyTaken, UserNotFound } from '../errors'
import { INVALID_PAYLOAD } from './messages'
import type { AppEnv } from '../context'

const NOT_FOUND = 'Usuário não encontrado'

export const list = async (c: Context<AppEnv>) =>
  c.json(await c.get('services').users.list())

export const findById = async (c: Context<AppEnv, '/:id'>) => {
  try {
    return c.json(await c.get('services').users.findById(c.req.param('id')))
  } catch (err) {
    if (err instanceof UserNotFound) {
      return c.json({ error: NOT_FOUND }, 404)
    }
    throw err
  }
}

export const create = async (c: Context<AppEnv>) => {
  const parsed = createUserSchema.safeParse(
    await c.req.json().catch(() => null)
  )
  if (!parsed.success) {
    return c.json({ error: INVALID_PAYLOAD, issues: parsed.error.issues }, 400)
  }

  try {
    return c.json(await c.get('services').users.create(parsed.data), 201)
  } catch (err) {
    if (err instanceof EmailAlreadyTaken) {
      return c.json({ error: 'Já existe um usuário com esse e-mail' }, 409)
    }
    throw err
  }
}

export const update = async (c: Context<AppEnv, '/:id'>) => {
  const parsed = updateUserSchema.safeParse(
    await c.req.json().catch(() => null)
  )
  if (!parsed.success) {
    return c.json({ error: INVALID_PAYLOAD, issues: parsed.error.issues }, 400)
  }

  try {
    return c.json(
      await c.get('services').users.update(c.req.param('id'), parsed.data)
    )
  } catch (err) {
    if (err instanceof UserNotFound) {
      return c.json({ error: NOT_FOUND }, 404)
    }
    if (err instanceof EmailAlreadyTaken) {
      return c.json({ error: 'Já existe um usuário com esse e-mail' }, 409)
    }
    throw err
  }
}

export const remove = async (c: Context<AppEnv, '/:id'>) => {
  try {
    await c.get('services').users.remove(c.req.param('id'))
    return c.body(null, 204)
  } catch (err) {
    if (err instanceof UserNotFound) {
      return c.json({ error: NOT_FOUND }, 404)
    }
    throw err
  }
}
