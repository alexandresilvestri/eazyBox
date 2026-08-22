import type { Context } from 'hono'
import {
  createWorkoutSessionSchema,
  updateWorkoutSessionSchema,
} from '@eazybox/shared'
import {
  SessionAlreadyScheduled,
  WorkoutNotFound,
  WorkoutScheduleNotFound,
  WorkoutSessionNotFound,
} from '../errors'
import type { AppEnv } from '../context'

const INVALID_PAYLOAD = 'Dados inválidos'
const NOT_FOUND = 'Sessão não encontrada'

export const list = async (c: Context<AppEnv>) =>
  c.json(await c.get('services').workoutSessions.list(c.req.query('from')))

export const findById = async (c: Context<AppEnv, '/:id'>) => {
  try {
    return c.json(
      await c.get('services').workoutSessions.findById(c.req.param('id'))
    )
  } catch (err) {
    if (err instanceof WorkoutSessionNotFound) {
      return c.json({ error: NOT_FOUND }, 404)
    }
    throw err
  }
}

export const create = async (c: Context<AppEnv>) => {
  const parsed = createWorkoutSessionSchema.safeParse(
    await c.req.json().catch(() => null)
  )
  if (!parsed.success) {
    return c.json({ error: INVALID_PAYLOAD, issues: parsed.error.issues }, 400)
  }
  try {
    return c.json(
      await c.get('services').workoutSessions.create(parsed.data),
      201
    )
  } catch (err) {
    if (err instanceof WorkoutScheduleNotFound) {
      return c.json({ error: 'Horário não encontrado' }, 404)
    }
    if (err instanceof WorkoutNotFound) {
      return c.json({ error: 'Treino não encontrado' }, 404)
    }
    if (err instanceof SessionAlreadyScheduled) {
      return c.json({ error: 'Já existe uma sessão nesse horário e data' }, 409)
    }
    throw err
  }
}

export const update = async (c: Context<AppEnv, '/:id'>) => {
  const parsed = updateWorkoutSessionSchema.safeParse(
    await c.req.json().catch(() => null)
  )
  if (!parsed.success) {
    return c.json({ error: INVALID_PAYLOAD, issues: parsed.error.issues }, 400)
  }
  try {
    return c.json(
      await c
        .get('services')
        .workoutSessions.update(c.req.param('id'), parsed.data)
    )
  } catch (err) {
    if (err instanceof WorkoutSessionNotFound) {
      return c.json({ error: NOT_FOUND }, 404)
    }
    if (err instanceof WorkoutNotFound) {
      return c.json({ error: 'Treino não encontrado' }, 404)
    }
    throw err
  }
}

export const remove = async (c: Context<AppEnv, '/:id'>) => {
  try {
    await c.get('services').workoutSessions.remove(c.req.param('id'))
    return c.body(null, 204)
  } catch (err) {
    if (err instanceof WorkoutSessionNotFound) {
      return c.json({ error: NOT_FOUND }, 404)
    }
    throw err
  }
}
