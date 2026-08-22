import type { Knex } from 'knex'
import type { WorkoutSession } from '@eazybox/shared'

const COLUMNS: (keyof WorkoutSession)[] = [
  'id',
  'workoutScheduleId',
  'workoutId',
  'weekDay',
  'time',
  'sessionDate',
  'createdAt',
  'updatedAt',
]

export class WorkoutSessionModel {
  constructor(private readonly db: Knex) {}

  findAll(from?: string) {
    const query = this.db<WorkoutSession>('workout_sessions')
      .select(COLUMNS)
      .whereNull('deletedAt')
      .orderBy(['sessionDate', 'time'])
    return from ? query.where('sessionDate', '>=', from) : query
  }

  findById(id: string) {
    return this.db<WorkoutSession>('workout_sessions')
      .select(COLUMNS)
      .where({ id })
      .whereNull('deletedAt')
      .first()
  }

  async insert(input: Partial<WorkoutSession>) {
    const [row] = await this.db('workout_sessions')
      .insert(input)
      .returning(COLUMNS)
    return row as WorkoutSession
  }

  async update(id: string, input: Partial<WorkoutSession>) {
    const [row] = await this.db('workout_sessions')
      .where({ id })
      .whereNull('deletedAt')
      .update({ ...input, updatedAt: this.db.fn.now() })
      .returning(COLUMNS)
    return row as WorkoutSession | undefined
  }

  softDelete(id: string) {
    return this.db('workout_sessions')
      .where({ id })
      .whereNull('deletedAt')
      .update({ deletedAt: this.db.fn.now() })
  }
}
