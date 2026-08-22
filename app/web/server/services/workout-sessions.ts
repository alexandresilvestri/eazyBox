import { cached, invalidate } from '../redis'
import {
  SessionAlreadyScheduled,
  WorkoutNotFound,
  WorkoutScheduleNotFound,
  WorkoutSessionNotFound,
} from '../errors'
import { isUniqueViolation, LIST_TTL_SECONDS } from './constants'
import type { WorkoutModel } from '../models/workout'
import type { WorkoutScheduleModel } from '../models/workout-schedule'
import type { WorkoutSessionModel } from '../models/workout-session'
import type {
  CreateWorkoutSessionInput,
  UpdateWorkoutSessionInput,
} from '@eazybox/shared'

const CACHE_PREFIX = 'workout-sessions:'

export class WorkoutSessionsService {
  constructor(
    private readonly sessions: WorkoutSessionModel,
    private readonly schedule: WorkoutScheduleModel,
    private readonly workouts: WorkoutModel
  ) {}

  list(from?: string) {
    return cached(
      `${CACHE_PREFIX}list:${from ?? 'all'}`,
      () => this.sessions.findAll(from),
      LIST_TTL_SECONDS
    )
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
        ...input,
        weekDay: slot.weekDay,
        time: slot.time,
      })
      await invalidate(CACHE_PREFIX)
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
    await invalidate(CACHE_PREFIX)
    return session
  }

  async remove(id: string) {
    const deleted = await this.sessions.softDelete(id)
    if (!deleted) {
      throw new WorkoutSessionNotFound()
    }
    await invalidate(CACHE_PREFIX)
  }
}
