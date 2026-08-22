import { cached, invalidate } from '../redis'
import { ScheduleSlotTaken, WorkoutScheduleNotFound } from '../errors'
import { isUniqueViolation, LIST_TTL_SECONDS } from './constants'
import type { WorkoutScheduleModel } from '../models/workout-schedule'
import type {
  CreateWorkoutScheduleInput,
  UpdateWorkoutScheduleInput,
} from '@eazybox/shared'

const CACHE_PREFIX = 'workout-schedule:'

export class WorkoutScheduleService {
  constructor(private readonly schedule: WorkoutScheduleModel) {}

  list() {
    return cached(
      `${CACHE_PREFIX}list`,
      () => this.schedule.findAll(),
      LIST_TTL_SECONDS
    )
  }

  async findById(id: string) {
    const slot = await this.schedule.findById(id)
    if (!slot) {
      throw new WorkoutScheduleNotFound()
    }
    return slot
  }

  async create(input: CreateWorkoutScheduleInput) {
    try {
      const slot = await this.schedule.insert(input)
      await invalidate(CACHE_PREFIX)
      return slot
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ScheduleSlotTaken()
      }
      throw err
    }
  }

  async update(id: string, input: UpdateWorkoutScheduleInput) {
    try {
      const slot = await this.schedule.update(id, input)
      if (!slot) {
        throw new WorkoutScheduleNotFound()
      }
      await invalidate(CACHE_PREFIX)
      return slot
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ScheduleSlotTaken()
      }
      throw err
    }
  }

  async remove(id: string) {
    const deleted = await this.schedule.softDelete(id)
    if (!deleted) {
      throw new WorkoutScheduleNotFound()
    }
    await invalidate(CACHE_PREFIX)
  }
}
