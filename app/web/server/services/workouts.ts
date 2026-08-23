import { cached, invalidate } from '../redis'
import { WorkoutNotFound } from '../errors'
import { CACHE_PREFIX, LIST_TTL_SECONDS } from './constants'

const PREFIX = CACHE_PREFIX.workouts
import type { WorkoutModel } from '../models/workout'
import type { CreateWorkoutInput, UpdateWorkoutInput } from '@eazybox/shared'

export class WorkoutsService {
  constructor(private readonly workouts: WorkoutModel) {}

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
    const deleted = await this.workouts.softDelete(id)
    if (!deleted) {
      throw new WorkoutNotFound()
    }
    await invalidate(PREFIX)
  }
}
