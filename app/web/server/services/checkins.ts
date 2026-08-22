import {
  AlreadyCheckedIn,
  CheckinNotFound,
  WorkoutSessionNotFound,
} from '../errors'
import { isUniqueViolation } from './constants'
import type { CheckinModel } from '../models/checkin'
import type { WorkoutSessionModel } from '../models/workout-session'
import type { CreateCheckinInput } from '@eazybox/shared'

export class CheckinsService {
  constructor(
    private readonly checkins: CheckinModel,
    private readonly sessions: WorkoutSessionModel
  ) {}

  list() {
    return this.checkins.findAll()
  }

  async create(userId: string, { workoutSessionId }: CreateCheckinInput) {
    const session = await this.sessions.findById(workoutSessionId)
    if (!session) {
      throw new WorkoutSessionNotFound()
    }

    try {
      return await this.checkins.insert({ userId, workoutSessionId })
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new AlreadyCheckedIn()
      }
      throw err
    }
  }

  async undo(id: string) {
    const checkin = await this.checkins.setUndone(id, true)
    if (!checkin) {
      throw new CheckinNotFound()
    }
    return checkin
  }
}
