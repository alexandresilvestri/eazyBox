import { cached, invalidate } from '../redis'
import {
  SessionAlreadyScheduled,
  WorkoutNotFound,
  WorkoutScheduleNotFound,
  WorkoutSessionNotFound,
} from '../errors'
import { isUniqueViolation, CACHE_PREFIX, LIST_TTL_SECONDS } from './constants'

const PREFIX = CACHE_PREFIX.workoutSessions
import type { WorkoutModel } from '../models/workout'
import type { WorkoutScheduleModel } from '../models/workout-schedule'
import type {
  SessionStatsRow,
  WorkoutSessionModel,
} from '../models/workout-session'
import type {
  CreateWorkoutSessionInput,
  UpdateWorkoutSessionInput,
  WorkoutSession,
  WorkoutSessionWithStats,
} from '@eazybox/shared'

const withStats = (
  sessions: WorkoutSession[],
  stats: SessionStatsRow[]
): WorkoutSessionWithStats[] => {
  const byId = new Map(stats.map((row) => [row.workoutSessionId, row]))
  return sessions.map((session) => {
    const row = byId.get(session.id)
    return {
      ...session,
      occupied: row?.occupied ?? 0,
      coach: row?.coachId
        ? {
            id: row.coachId,
            firstName: row.coachFirstName ?? '',
            lastName: row.coachLastName ?? '',
          }
        : null,
    }
  })
}

export class WorkoutSessionsService {
  constructor(
    private readonly sessions: WorkoutSessionModel,
    private readonly schedule: WorkoutScheduleModel,
    private readonly workouts: WorkoutModel
  ) {}

  list(from?: string) {
    return cached(
      `${PREFIX}list:${from ?? 'all'}`,
      async () =>
        withStats(
          await this.sessions.findAll(from),
          await this.sessions.findStats(from)
        ),
      LIST_TTL_SECONDS
    )
  }

  async attendees(id: string) {
    const attendees = await this.sessions.findAttendees(id)
    if (attendees.length === 0) {
      await this.findById(id)
    }
    return attendees
  }

  async findById(id: string) {
    const session = await this.sessions.findById(id)
    if (!session) {
      throw new WorkoutSessionNotFound()
    }
    return session
  }

  async create(input: CreateWorkoutSessionInput) {
    const slot = await this.schedule.findById(input.workoutScheduleId)
    if (!slot) {
      throw new WorkoutScheduleNotFound()
    }
    const workout = await this.workouts.findById(input.workoutId)
    if (!workout) {
      throw new WorkoutNotFound()
    }

    try {
      const session = await this.sessions.insert({
        capacity: slot.capacity,
        coachId: slot.coachId,
        ...input,
        weekDay: slot.weekDay,
        time: slot.time,
      })
      await invalidate(PREFIX)
      return session
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new SessionAlreadyScheduled()
      }
      throw err
    }
  }

  async update(id: string, input: UpdateWorkoutSessionInput) {
    if (input.workoutId) {
      const workout = await this.workouts.findById(input.workoutId)
      if (!workout) {
        throw new WorkoutNotFound()
      }
    }
    const session = await this.sessions.update(id, input)
    if (!session) {
      throw new WorkoutSessionNotFound()
    }
    await invalidate(PREFIX)
    return session
  }

  async remove(id: string) {
    const deleted = await this.sessions.softDelete(id)
    if (!deleted) {
      throw new WorkoutSessionNotFound()
    }
    await invalidate(PREFIX)
  }
}
