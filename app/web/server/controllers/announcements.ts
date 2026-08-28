import type { Context } from 'hono'
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from '@eazybox/shared'
import { AnnouncementNotFound } from '../errors'
import { INVALID_PAYLOAD } from './messages'
import type { AppEnv } from '../context'

const NOT_FOUND = 'Aviso não encontrado'

export const list = async (c: Context<AppEnv>) =>
  c.json(await c.get('services').announcements.list())

export const create = async (c: Context<AppEnv>) => {
  const parsed = createAnnouncementSchema.safeParse(
    await c.req.json().catch(() => null)
  )
  if (!parsed.success) {
    return c.json({ error: INVALID_PAYLOAD, issues: parsed.error.issues }, 400)
  }
  return c.json(
    await c
      .get('services')
      .announcements.create(c.get('auth').userId, parsed.data),
    201
  )
}

export const update = async (c: Context<AppEnv, '/:id'>) => {
  const parsed = updateAnnouncementSchema.safeParse(
    await c.req.json().catch(() => null)
  )
  if (!parsed.success) {
    return c.json({ error: INVALID_PAYLOAD, issues: parsed.error.issues }, 400)
  }
  try {
    return c.json(
      await c
        .get('services')
        .announcements.update(c.req.param('id'), parsed.data)
    )
  } catch (err) {
    if (err instanceof AnnouncementNotFound) {
      return c.json({ error: NOT_FOUND }, 404)
    }
    throw err
  }
}

export const remove = async (c: Context<AppEnv, '/:id'>) => {
  try {
    await c.get('services').announcements.remove(c.req.param('id'))
    return c.body(null, 204)
  } catch (err) {
    if (err instanceof AnnouncementNotFound) {
      return c.json({ error: NOT_FOUND }, 404)
    }
    throw err
  }
}
