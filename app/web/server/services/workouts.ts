import { cached, invalidate } from '../redis'
import { WorkoutInUse, WorkoutNotFound } from '../errors'
import { CACHE_PREFIX, LIST_TTL_SECONDS } from './constants'

const PREFIX = CACHE_PREFIX.workouts
import type { WorkoutModel } from '../models/workout'
import type { WorkoutSessionModel } from '../models/workout-session'
import type { CreateWorkoutInput, UpdateWorkoutInput } from '@eazybox/shared'

export class WorkoutsService {
  constructor(
    private readonly workouts: WorkoutModel,
    private readonly workoutSessions: WorkoutSessionModel
  ) {}

  list() {
    return cached(
      `${PREFIX}list`,
      () => this.workouts.findAll(),
      LIST_TTL_SECONDS
    )
  }

  async findById(id: string) {
    const workout = await this.workouts.findById(id)
    if (!workout) {
      throw new WorkoutNotFound()
    }
    return workout
  }

  async create(input: CreateWorkoutInput) {
    const workout = await this.workouts.insert(input)
    await invalidate(PREFIX)
    return workout
  }

  async update(id: string, input: UpdateWorkoutInput) {
    const workout = await this.workouts.update(id, input)
    if (!workout) {
      throw new WorkoutNotFound()
    }
    await invalidate(PREFIX)
    return workout
  }

  async remove(id: string) {
    if (await this.workoutSessions.findAnyByWorkout(id)) {
      throw new WorkoutInUse()
    }
    const deleted = await this.workouts.softDelete(id)
    if (!deleted) {
      throw new WorkoutNotFound()
    }
    await invalidate(PREFIX)
  }
}
