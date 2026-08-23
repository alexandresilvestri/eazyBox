import type { Context } from 'hono'
import {
  createWorkoutScheduleSchema,
  updateWorkoutScheduleSchema,
} from '@eazybox/shared'
import { ScheduleSlotTaken, WorkoutScheduleNotFound } from '../errors'
import { INVALID_PAYLOAD } from './messages'
import type { AppEnv } from '../context'

const NOT_FOUND = 'Horário não encontrado'
const SLOT_TAKEN = 'Já existe um horário nesse dia e hora'

export const list = async (c: Context<AppEnv>) =>
  c.json(await c.get('services').workoutSchedule.list())

export const findById = async (c: Context<AppEnv, '/:id'>) => {
  try {
    return c.json(
      await c.get('services').workoutSchedule.findById(c.req.param('id'))
    )
  } catch (err) {
    if (err instanceof WorkoutScheduleNotFound) {
      return c.json({ error: NOT_FOUND }, 404)
    }
    throw err
  }
}

export const create = async (c: Context<AppEnv>) => {
  const parsed = createWorkoutScheduleSchema.safeParse(
    await c.req.json().catch(() => null)
  )
  if (!parsed.success) {
    return c.json({ error: INVALID_PAYLOAD, issues: parsed.error.issues }, 400)
  }
  try {
    return c.json(
      await c.get('services').workoutSchedule.create(parsed.data),
      201
    )
  } catch (err) {
    if (err instanceof ScheduleSlotTaken) {
      return c.json({ error: SLOT_TAKEN }, 409)
    }
    throw err
  }
}

export const update = async (c: Context<AppEnv, '/:id'>) => {
  const parsed = updateWorkoutScheduleSchema.safeParse(
    await c.req.json().catch(() => null)
  )
  if (!parsed.success) {
    return c.json({ error: INVALID_PAYLOAD, issues: parsed.error.issues }, 400)
  }
  try {
    return c.json(
      await c
        .get('services')
        .workoutSchedule.update(c.req.param('id'), parsed.data)
    )
  } catch (err) {
    if (err instanceof WorkoutScheduleNotFound) {
      return c.json({ error: NOT_FOUND }, 404)
    }
    if (err instanceof ScheduleSlotTaken) {
      return c.json({ error: SLOT_TAKEN }, 409)
    }
    throw err
  }
}

export const remove = async (c: Context<AppEnv, '/:id'>) => {
  try {
    await c.get('services').workoutSchedule.remove(c.req.param('id'))
    return c.body(null, 204)
  } catch (err) {
    if (err instanceof WorkoutScheduleNotFound) {
      return c.json({ error: NOT_FOUND }, 404)
    }
    throw err
  }
}
