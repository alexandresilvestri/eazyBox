import type { Context } from 'hono'
import { createWorkoutSchema, updateWorkoutSchema } from '@eazybox/shared'
import { WorkoutNotFound } from '../errors'
import type { AppEnv } from '../context'

const INVALID_PAYLOAD = 'Dados inválidos'
const NOT_FOUND = 'Treino não encontrado'

export const list = async (c: Context<AppEnv>) =>
  c.json(await c.get('services').workouts.list())

export const findById = async (c: Context<AppEnv, '/:id'>) => {
  try {
    return c.json(await c.get('services').workouts.findById(c.req.param('id')))
  } catch (err) {
    if (err instanceof WorkoutNotFound) {
      return c.json({ error: NOT_FOUND }, 404)
    }
    throw err
  }
}

export const create = async (c: Context<AppEnv>) => {
  const parsed = createWorkoutSchema.safeParse(
    await c.req.json().catch(() => null)
  )
  if (!parsed.success) {
    return c.json({ error: INVALID_PAYLOAD, issues: parsed.error.issues }, 400)
  }
  return c.json(await c.get('services').workouts.create(parsed.data), 201)
}

export const update = async (c: Context<AppEnv, '/:id'>) => {
  const parsed = updateWorkoutSchema.safeParse(
    await c.req.json().catch(() => null)
  )
  if (!parsed.success) {
    return c.json({ error: INVALID_PAYLOAD, issues: parsed.error.issues }, 400)
  }
  try {
    return c.json(
      await c.get('services').workouts.update(c.req.param('id'), parsed.data)
    )
  } catch (err) {
    if (err instanceof WorkoutNotFound) {
      return c.json({ error: NOT_FOUND }, 404)
    }
    throw err
  }
}

export const remove = async (c: Context<AppEnv, '/:id'>) => {
  try {
    await c.get('services').workouts.remove(c.req.param('id'))
    return c.body(null, 204)
  } catch (err) {
    if (err instanceof WorkoutNotFound) {
      return c.json({ error: NOT_FOUND }, 404)
    }
    throw err
  }
}
