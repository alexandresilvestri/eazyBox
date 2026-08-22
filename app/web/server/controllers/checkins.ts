import type { Context } from 'hono'
import { createCheckinSchema } from '@eazybox/shared'
import {
  AlreadyCheckedIn,
  CheckinNotFound,
  WorkoutSessionNotFound,
} from '../errors'
import type { AppEnv } from '../context'

const INVALID_PAYLOAD = 'Dados inválidos'

export const list = async (c: Context<AppEnv>) =>
  c.json(await c.get('services').checkins.list())

export const create = async (c: Context<AppEnv>) => {
  const parsed = createCheckinSchema.safeParse(
    await c.req.json().catch(() => null)
  )
  if (!parsed.success) {
    return c.json({ error: INVALID_PAYLOAD, issues: parsed.error.issues }, 400)
  }

  try {
    return c.json(
      await c
        .get('services')
        .checkins.create(c.get('auth').userId, parsed.data),
      201
    )
  } catch (err) {
    if (err instanceof WorkoutSessionNotFound) {
      return c.json({ error: 'Sessão não encontrada' }, 404)
    }
    if (err instanceof AlreadyCheckedIn) {
      return c.json({ error: 'Check-in já realizado nessa sessão' }, 409)
    }
    throw err
  }
}

export const undo = async (c: Context<AppEnv, '/:id/undo'>) => {
  try {
    return c.json(await c.get('services').checkins.undo(c.req.param('id')))
  } catch (err) {
    if (err instanceof CheckinNotFound) {
      return c.json({ error: 'Check-in não encontrado' }, 404)
    }
    throw err
  }
}
