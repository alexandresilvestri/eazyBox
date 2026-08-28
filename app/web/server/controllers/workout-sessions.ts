import type { Context } from 'hono'
import {
  addAttendeeSchema,
  createWorkoutSessionSchema,
  updateWorkoutSessionSchema,
} from '@eazybox/shared'
import {
  AlreadyCheckedIn,
  SessionAlreadyScheduled,
  WorkoutNotFound,
  WorkoutScheduleNotFound,
  WorkoutSessionNotFound,
} from '../errors'
import { INVALID_PAYLOAD } from './messages'
import type { AppEnv } from '../context'

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

export const attendees = async (c: Context<AppEnv, '/:id/attendees'>) => {
  try {
    return c.json(
      await c.get('services').workoutSessions.attendees(c.req.param('id'))
    )
  } catch (err) {
    if (err instanceof WorkoutSessionNotFound) {
      return c.json({ error: NOT_FOUND }, 404)
    }
    throw err
  }
}

export const addAttendee = async (c: Context<AppEnv, '/:id/attendees'>) => {
  const parsed = addAttendeeSchema.safeParse(
    await c.req.json().catch(() => null)
  )
  if (!parsed.success) {
    return c.json({ error: INVALID_PAYLOAD, issues: parsed.error.issues }, 400)
  }

  try {
    return c.json(
      await c.get('services').checkins.create(parsed.data.userId, {
        workoutSessionId: c.req.param('id'),
      }),
      201
    )
  } catch (err) {
    if (err instanceof WorkoutSessionNotFound) {
      return c.json({ error: NOT_FOUND }, 404)
    }
    if (err instanceof AlreadyCheckedIn) {
      return c.json({ error: 'Aluno já confirmado nessa aula' }, 409)
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
